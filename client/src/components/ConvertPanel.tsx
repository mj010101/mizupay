import {
  Box,
  Button,
  Flex,
  Text,
  TextField,
  Card,
  Tabs,
} from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { FeaturePanel } from "./FeaturePanel";
import { tokenIcons } from "../config";
import { useWallet } from "@suiet/wallet-kit";
import {
  fetchSMZUSDPriceRatio,
  buildStakeTx,
  buildUnstakeTx,
} from "../utils/contract";
import { suiClient } from "../utils/suiClient";
import { LBTC_TYPE, MZUSD_TYPE, SMZUSD_TYPE } from "../suiConfig";

type TokenRates = {
  [key: string]: number;
};

type Mode = "btc" | "mzUSD";

const modeRatesMap: Record<Mode, TokenRates> = {
  btc: {
    "BTC-LBTC": 1,
    "LBTC-BTC": 1,
  },
  mzUSD: {
    "mzUSD-smzUSD": 1,
    "smzUSD-mzUSD": 1,
  },
};

export function ConvertPanel({ mode }: { mode: Mode }) {
  const wallet = useWallet();
  const { connected, address } = wallet;

  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  // Dynamic SMZUSD price ratio fetched from chain (scaled by 1e4). Defaults to 1:1.
  const [smzusdRatio, setSmzusdRatio] = useState<number>(10000);

  // --- New: balance state for the `from` token ---
  const [fromBalance, setFromBalance] = useState<number | null>(null);

  useEffect(() => {
    if (mode === "btc") {
      if (activeTab === "stake") {
        setFromToken("BTC");
        setToToken("LBTC");
      } else {
        setFromToken("LBTC");
        setToToken("BTC");
      }
    } else if (mode === "mzUSD") {
      if (activeTab === "stake") {
        setFromToken("mzUSD");
        setToToken("smzUSD");
      } else {
        setFromToken("smzUSD");
        setToToken("mzUSD");
      }
    }
  }, [activeTab, mode]);

  // Compute the current conversion rate.
  const getRate = () => {
    if (mode === "btc") {
      const key = `${fromToken}-${toToken}`;
      return modeRatesMap[mode][key] || 0;
    }

    // smzusdRatio is scaled by 1e4. Convert to floating multiplier.
    const ratio = smzusdRatio / 1e4;

    // If converting mzUSD -> smzUSD (stake), rate = 1 / ratio (assuming ratio = smzUSD price in mzUSD terms)
    // For symmetry we invert when needed.
    if (fromToken === "mzUSD" && toToken === "smzUSD") {
      return 1 / ratio;
    }
    if (fromToken === "smzUSD" && toToken === "mzUSD") {
      return ratio;
    }
    return 0;
  };

  const getEstimatedAmount = () => {
    if (!amount) return "0";
    const rate = getRate();
    return (parseFloat(amount) * rate).toFixed(6);
  };

  // Fetch SMZUSD price ratio periodically when mode is mzUSD.
  useEffect(() => {
    if (mode !== "mzUSD") return;

    const fetchRatio = async () => {
      const ratio = await fetchSMZUSDPriceRatio();
      if (ratio !== null && ratio > 0) {
        setSmzusdRatio(ratio);
      }
    };

    fetchRatio();
    const interval = setInterval(fetchRatio, 30000);
    return () => clearInterval(interval);
  }, [mode]);

  // Fetch the wallet balance for the currently selected `fromToken`
  useEffect(() => {
    if (!connected || !address) {
      setFromBalance(null);
      return;
    }

    const coinTypeMap: Record<string, string | undefined> = {
      LBTC: LBTC_TYPE,
      mzUSD: MZUSD_TYPE,
      smzUSD: SMZUSD_TYPE,
    };

    const coinType = coinTypeMap[fromToken];

    // If we don't have a mapping (e.g. BTC), skip fetching balance.
    if (!coinType) {
      setFromBalance(null);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      try {
        const bal = await suiClient.getBalance({
          owner: address,
          coinType,
        });
        console.log("bal", bal);
        if (cancelled) return;
        const balanceNum = Number(bal.totalBalance) / 1e9; // assume 9 decimals
        setFromBalance(balanceNum);
      } catch (err) {
        console.error("Failed to fetch balance for", fromToken, err);
        if (!cancelled) setFromBalance(null);
      }
    };

    fetchBalance();

    // Optionally refresh every 30s
    const interval = setInterval(fetchBalance, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [connected, address, fromToken]);

  // --- Utility to determine if entered amount exceeds balance ---
  const exceedsBalance = (() => {
    if (fromBalance === null) return false; // unknown balance, don't block
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return false;
    return numericAmount > fromBalance;
  })();

  const handleSwap = async () => {
    if (!connected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsSwapping(true);
    try {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Invalid amount");
      }

      let tx;
      if (activeTab === "stake") {
        tx = await buildStakeTx(address, numericAmount);
      } else {
        tx = await buildUnstakeTx(numericAmount);
      }

      // sign and execute
      const result = await wallet.signAndExecuteTransactionBlock({
        // Casting to any to avoid type mismatch between SDK versions.
        transactionBlock: tx as any,
      });

      console.log("Tx result", result);

      const estimated = getEstimatedAmount();
      setAmount("");
      alert(
        `Successfully ${
          activeTab === "stake" ? "staked" : "unstaked"
        } ${amount} ${fromToken} to ${estimated} ${toToken}`
      );
    } catch (error: unknown) {
      console.error("Swap failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Operation failed: ${errorMessage}`);
    } finally {
      setIsSwapping(false);
    }
  };

  const operationString = activeTab === "stake" ? "Stake" : "Unstake";

  return (
    <FeaturePanel>
      <Card
        style={{
          maxWidth: "450px",
          width: "100%",
          background: "rgba(1, 24, 41, 0.8)",
          border: "1px solid rgba(77, 162, 255, 0.3)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow =
            "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -6px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow =
            "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
        }}
      >
        <Flex direction="column" gap="4">
          <Tabs.Root
            defaultValue="stake"
            onValueChange={(value) =>
              setActiveTab(value as "stake" | "unstake")
            }
          >
            <Tabs.List>
              <Tabs.Trigger
                value="stake"
                style={{ width: "50%", fontSize: "16px", padding: "12px" }}
              >
                Stake
              </Tabs.Trigger>
              <Tabs.Trigger
                value="unstake"
                style={{ width: "50%", fontSize: "16px", padding: "12px" }}
              >
                Unstake
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          <Box>
            <Flex justify="between" align="baseline">
              <Text
                as="label"
                size="3"
                weight="bold"
                style={{ color: "#4DA2FF" }}
              >
                From
              </Text>
              <Text size="2" color="gray">
                Balance:{" "}
                {fromBalance !== null
                  ? fromBalance.toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })
                  : "-"}
              </Text>
            </Flex>
            <Flex gap="2" style={{ marginTop: "6px" }}>
              <Box
                style={{
                  width: "160px",
                  height: "45px",
                  border: "1px solid var(--gray-7)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  backgroundColor: "var(--gray-3)",
                }}
              >
                <Flex align="center" gap="2">
                  {tokenIcons[fromToken]?.endsWith(".svg") ? (
                    <img
                      src={tokenIcons[fromToken]}
                      alt={fromToken}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <Text
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "var(--indigo-9)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {tokenIcons[fromToken] || "?"}
                    </Text>
                  )}
                  <Text weight="medium" size="3">
                    {fromToken}
                  </Text>
                </Flex>
              </Box>
              <TextField.Root
                style={{ width: "100%", fontSize: "16px", height: "45px" }}
                placeholder="0.0"
                type="number"
                value={amount}
                onChange={(e: React.SyntheticEvent<HTMLInputElement>) =>
                  setAmount(e.currentTarget.value)
                }
                size="3"
              />
            </Flex>
          </Box>

          <Box style={{ marginTop: "8px" }}>
            <Text
              as="label"
              size="3"
              weight="bold"
              style={{ color: "#4DA2FF" }}
            >
              To
            </Text>
            <Flex gap="2" style={{ marginTop: "6px" }}>
              <Box
                style={{
                  width: "160px",
                  height: "45px",
                  border: "1px solid var(--gray-7)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  backgroundColor: "var(--gray-3)",
                }}
              >
                <Flex align="center" gap="2">
                  {tokenIcons[toToken]?.endsWith(".svg") ? (
                    <img
                      src={tokenIcons[toToken]}
                      alt={toToken}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <Text
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "var(--indigo-9)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {tokenIcons[toToken] || "?"}
                    </Text>
                  )}
                  <Text weight="medium" size="3">
                    {toToken}
                  </Text>
                </Flex>
              </Box>
              <TextField.Root
                style={{ width: "100%", fontSize: "16px", height: "45px" }}
                placeholder="0.0"
                type="number"
                value={getEstimatedAmount()}
                readOnly
                size="3"
              />
            </Flex>
          </Box>

          <Box style={{ marginTop: "12px" }}>
            <Text size="2" style={{ color: "#CEE3E4" }}>
              Rate: 1 {fromToken} = {getRate()} {toToken}
            </Text>
          </Box>

          <Button
            color="indigo"
            size="4"
            onClick={handleSwap}
            disabled={
              !amount || !connected || isSwapping || !toToken || exceedsBalance
            }
            style={{
              background: "linear-gradient(45deg, #4DA2FF, #63C9B9)",
              borderRadius: "24px",
              color: "white",
              boxShadow: "0 4px 14px rgba(77, 162, 255, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
              marginTop: "16px",
              fontSize: "16px",
              padding: "0 20px",
              height: "50px",
            }}
            onMouseEnter={(e) => {
              if (amount && connected && !isSwapping && toToken) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(77, 162, 255, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(77, 162, 255, 0.4)";
            }}
          >
            {isSwapping
              ? `${operationString}...`
              : connected
              ? operationString
              : `Connect Wallet to ${operationString}`}
          </Button>
        </Flex>
      </Card>
    </FeaturePanel>
  );
}

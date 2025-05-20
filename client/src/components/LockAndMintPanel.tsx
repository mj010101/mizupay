import {
  Box,
  Button,
  Flex,
  Text,
  TextField,
  Separator,
  Card,
} from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { FeaturePanel } from "./FeaturePanel";
import { useWallet } from "@suiet/wallet-kit";
import { tokenIcons } from "../config";
import {
  fetchOnchainBTCPrice,
  buildDepositAndBorrowTx,
} from "../utils/contract";

export function LockAndMintPanel() {
  const wallet = useWallet();
  const { connected, address } = wallet;
  const [btcAmount, setBtcAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const LTV = 0.7;

  useEffect(() => {
    const getPrice = async () => {
      const price = await fetchOnchainBTCPrice();
      if (price !== null) {
        // On-chain price is stored with 9 decimals. Convert to floating number in USD.
        setBtcPrice(price / 1e9);
      }
    };

    getPrice();

    const interval = setInterval(getPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (btcAmount && btcPrice) {
      const valueInUSD = parseFloat(btcAmount) * btcPrice;
      const mintableUSD = valueInUSD * LTV;
      setUsdAmount(mintableUSD.toFixed(2));
    } else {
      setUsdAmount("");
    }
  }, [btcAmount, btcPrice]);

  const handleLockAndMint = async () => {
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    try {
      if (!address) throw new Error("Wallet address not available");

      const tx = await buildDepositAndBorrowTx(
        address,
        parseFloat(btcAmount),
        parseFloat(usdAmount),
      );

      const result = await wallet.signAndExecuteTransactionBlock({
        // Casting to any to avoid potential version mismatch of the Transaction type across packages.
        transactionBlock: tx as any,
      });

      console.log("Tx result", result);

      setBtcAmount("");
      setUsdAmount("");
      alert(
        `Successfully locked ${btcAmount} LBTC and minted ${usdAmount} mzUSD`,
      );
    } catch (error: unknown) {
      console.error("Operation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Operation failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FeaturePanel>
      <Card
        style={{
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
        <Flex direction="row" gap="8" align="center">
          <Box style={{ flex: 1 }}>
            <Flex direction="column" gap="3">
              <Text
                as="label"
                size="3"
                weight="bold"
                style={{ color: "#4DA2FF" }}
              >
                Lock LBTC as Collateral
              </Text>
              <Flex gap="2" align="center">
                <Box
                  style={{
                    width: "160px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 12px",
                    background: "rgba(77, 162, 255, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(77, 162, 255, 0.2)",
                  }}
                >
                  {tokenIcons.LBTC.endsWith(".svg") ? (
                    <img
                      src={tokenIcons.LBTC}
                      alt="LBTC"
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "8px",
                      }}
                    />
                  ) : (
                    <Text
                      size="3"
                      weight="medium"
                      style={{ marginRight: "8px" }}
                    >
                      {tokenIcons.LBTC}
                    </Text>
                  )}
                  <Text size="3" weight="medium">
                    LBTC
                  </Text>
                </Box>
                <TextField.Root
                  style={{ width: "100%", fontSize: "16px" }}
                  placeholder="0.0"
                  type="number"
                  value={btcAmount}
                  onChange={(e: React.SyntheticEvent<HTMLInputElement>) =>
                    setBtcAmount(e.currentTarget.value)
                  }
                  size="3"
                />
              </Flex>
              {btcPrice && (
                <Text size="2" style={{ color: "#CEE3E4" }}>
                  1 BTC = ${btcPrice.toFixed(2)} USD
                </Text>
              )}
            </Flex>
          </Box>

          <Separator
            orientation="vertical"
            size="4"
            style={{
              background:
                "linear-gradient(to bottom, rgba(99, 102, 241, 0.1), rgba(147, 51, 234, 0.1))",
              height: "120px",
            }}
          />

          <Box style={{ flex: 1 }}>
            <Flex direction="column" gap="3">
              <Text
                as="label"
                size="3"
                weight="bold"
                style={{ color: "#4DA2FF" }}
              >
                Mint mzUSD (70% LTV)
              </Text>
              <Flex gap="2" align="center">
                <Box
                  style={{
                    width: "160px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 12px",
                    background: "rgba(99, 201, 185, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid rgba(99, 201, 185, 0.2)",
                  }}
                >
                  {tokenIcons.mzUSD.endsWith(".svg") ? (
                    <img
                      src={tokenIcons.mzUSD}
                      alt="mzUSD"
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "8px",
                      }}
                    />
                  ) : (
                    <Text
                      size="3"
                      weight="medium"
                      style={{ marginRight: "8px" }}
                    >
                      {tokenIcons.mzUSD}
                    </Text>
                  )}
                  <Text size="3" weight="medium">
                    mzUSD
                  </Text>
                </Box>
                <TextField.Root
                  style={{ width: "100%", fontSize: "16px", height: "45px" }}
                  placeholder="0.0"
                  type="number"
                  value={usdAmount}
                  readOnly
                  size="3"
                />
              </Flex>
              <Text size="2" style={{ color: "#CEE3E4" }}>
                LTV Ratio: 70%
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Box style={{ marginTop: "24px" }}>
          <Button
            color="indigo"
            size="4"
            style={{
              width: "100%",
              background: "linear-gradient(45deg, #4DA2FF, #63C9B9)",
              borderRadius: "24px",
              color: "white",
              boxShadow: "0 4px 14px rgba(77, 162, 255, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
              fontSize: "16px",
              padding: "0 20px",
              height: "50px",
            }}
            onClick={handleLockAndMint}
            disabled={
              !btcAmount ||
              parseFloat(btcAmount) <= 0 ||
              !connected ||
              isProcessing
            }
            onMouseEnter={(e) => {
              if (
                btcAmount &&
                parseFloat(btcAmount) > 0 &&
                connected &&
                !isProcessing
              ) {
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
            {isProcessing
              ? "Processing..."
              : connected
              ? "Lock & Mint"
              : "Connect Wallet to Lock & Mint"}
          </Button>
        </Box>
      </Card>
    </FeaturePanel>
  );
}

import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import { MZUSD_TYPE, SMZUSD_TYPE, LBTC_TYPE } from "../suiConfig";
import { suiClient } from "../utils/suiClient";
import { fetchOnchainBTCPrice } from "../utils/contract";

// ----- Binance BTC 24h change cache helpers -----
const BINANCE_BTC_CHANGE_CACHE_KEY = "binance_btc24h_change_percent";
const CACHE_TTL_MS = 60_000; // 1 minute

async function getBTC24hChangePercent(): Promise<number | null> {
  // Guard against non-browser environments
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }

  try {
    const cached = localStorage.getItem(BINANCE_BTC_CHANGE_CACHE_KEY);
    if (cached) {
      const { value, ts } = JSON.parse(cached) as {
        value: number;
        ts: number;
      };
      if (Date.now() - ts < CACHE_TTL_MS) {
        return value;
      }
    }

    // Fetch fresh data
    const res = await fetch(
      "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT",
    );
    const data = (await res.json()) as { priceChangePercent?: string };
    if (data.priceChangePercent !== undefined) {
      const value = parseFloat(data.priceChangePercent);
      // Cache the value with timestamp
      localStorage.setItem(
        BINANCE_BTC_CHANGE_CACHE_KEY,
        JSON.stringify({ value, ts: Date.now() }),
      );
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export const useDashboardData = () => {
  const wallet = useWallet();
  const account = wallet?.account;
  const isConnected = !!account;

  // ---------- State ----------
  const [assetData, setAssetData] = useState({
    LBTC: {
      value: "-",
      change: "-",
      isPositive: true,
      dollarValue: undefined as string | undefined,
    },
    mzUSD: {
      value: "-",
      change: "-",
      isPositive: true,
    },
    smzUSD: {
      value: "-",
      change: "-",
      isPositive: true,
    },
  });

  // ---------- Effects ----------
  useEffect(() => {
    // Only fetch when wallet connected & address available
    if (!isConnected || !account?.address) {
      console.log(isConnected, account?.address);
      setAssetData((prev) => ({
        ...prev,
        LBTC: { ...prev.LBTC, value: "-", change: "-", dollarValue: undefined },
        mzUSD: { ...prev.mzUSD, value: "-", change: "-" },
        smzUSD: { ...prev.smzUSD, value: "-", change: "-" },
      }));
      return;
    }

    let cancelled = false;

    const fetchBalances = async () => {
      try {
        // Parallel fetches for efficiency
        const [mzUSDBal, smzUSDBal, lbtcBal, btcPriceRaw, btcChangePercent] =
          await Promise.all([
            suiClient.getBalance({
              owner: account.address,
              coinType: MZUSD_TYPE,
            }),
            suiClient.getBalance({
              owner: account.address,
              coinType: SMZUSD_TYPE,
            }),
            suiClient.getBalance({
              owner: account.address,
              coinType: LBTC_TYPE,
            }),
            fetchOnchainBTCPrice(),
            getBTC24hChangePercent(),
          ]);

        if (cancelled) return;

        // Convert on-chain balances (u64) to decimals (assume 9 decimals)
        const DECIMALS = 1e9;
        const mzUSDAmount = Number(mzUSDBal.totalBalance) / DECIMALS;
        const smzUSDAmount = Number(smzUSDBal.totalBalance) / DECIMALS;
        const lbtcAmount = Number(lbtcBal.totalBalance) / DECIMALS;

        // Compute dollar value for LBTC using on-chain price if available
        let lbtcDollarValue: string | undefined = undefined;
        if (btcPriceRaw && btcPriceRaw > 0) {
          const pricePerBtc = btcPriceRaw / DECIMALS; // convert back to decimal
          const valueInZusd = lbtcAmount * pricePerBtc;
          lbtcDollarValue = `$${valueInZusd.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`;
        }

        // Determine BTC change display
        let btcChangeDisplay = "-";
        let btcIsPositive = true;
        if (btcChangePercent !== null) {
          const deltaBtc = (lbtcAmount * Math.abs(btcChangePercent)) / 100;
          btcChangeDisplay = `${deltaBtc.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })} BTC (${Math.abs(btcChangePercent).toFixed(2)}%)`;
          btcIsPositive = btcChangePercent >= 0;
        }

        setAssetData((prev) => ({
          ...prev,
          LBTC: {
            ...prev.LBTC,
            value: `${lbtcAmount.toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })} BTC`,
            change: btcChangeDisplay,
            isPositive: btcIsPositive,
            dollarValue: lbtcDollarValue,
          },
          mzUSD: {
            ...prev.mzUSD,
            value: `${mzUSDAmount.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })} mzUSD`,
            change: "-", // real-time change not yet implemented
          },
          smzUSD: {
            ...prev.smzUSD,
            value: `${smzUSDAmount.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })} smzUSD`,
            change: "-",
            // Optionally, we could add dollar equivalent here in the future
          },
        }));
      } catch (e) {
        console.error("Failed to fetch dashboard balances", e);
      }
    };

    fetchBalances();

    // Optional: refresh every 30s
    const interval = setInterval(fetchBalances, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isConnected, account?.address]);

  const yieldData = {
    totalYield: isConnected ? "$1,245.65" : "-",
    currentAPY: isConnected ? "15.2%" : "-",
    changeFromLastMonth: isConnected ? "+2.3% from last month" : "-",
  };

  const vaultData = {
    bluefin: {
      percentage: isConnected ? 50 : 0,
      apy: isConnected ? "12.97%" : "-",
      amount: isConnected ? "$3,741" : "-",
      color: "#4DA2FF",
    },
    Suilend: {
      percentage: isConnected ? 20 : 0,
      apy: isConnected ? "3.03%" : "-",
      amount: isConnected ? "$2,912" : "-",
      color: "#63C9B9",
    },
    mzUSDPool: {
      percentage: isConnected ? 30 : 0,
      apy: isConnected ? "11.59%" : "-",
      amount: isConnected ? "$1,664" : "-",
      color: "#2E5A5A",
    },
  };

  return {
    isConnected,
    assetData,
    yieldData,
    vaultData,
  };
};

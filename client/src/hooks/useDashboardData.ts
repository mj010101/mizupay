import { useWallets } from "@wallet-standard/react";

export const useDashboardData = () => {
  const [wallet] = useWallets();
  const account = wallet?.accounts?.[0];
  const isConnected = !!account;

  const assetData = {
    zBTC: {
      value: isConnected ? "1.25 BTC" : "-",
      change: isConnected ? "0.05 BTC (4.2%)" : "-",
      isPositive: true,
      dollarValue: isConnected ? "$104,319" : undefined,
    },
    zUSD: {
      value: isConnected ? "$15,750" : "-",
      change: isConnected ? "$750 (5.0%)" : "-",
      isPositive: true,
    },
    szUSD: {
      value: isConnected ? "$8,320" : "-",
      change: isConnected ? "$320 (4.0%)" : "-",
      isPositive: true,
    },
  };

  const yieldData = {
    totalYield: isConnected ? "$1,245.65" : "-",
    currentAPY: isConnected ? "15.2%" : "-",
    changeFromLastMonth: isConnected ? "+2.3% from last month" : "-",
  };

  const vaultData = {
    drift: {
      percentage: isConnected ? 45 : 0,
      apy: isConnected ? "16.8%" : "-",
      amount: isConnected ? "$3,741" : "-",
      color: "var(--indigo-11)",
    },
    kamino: {
      percentage: isConnected ? 35 : 0,
      apy: isConnected ? "14.5%" : "-",
      amount: isConnected ? "$2,912" : "-",
      color: "var(--purple-11)",
    },
    zUSDPool: {
      percentage: isConnected ? 20 : 0,
      apy: isConnected ? "12.3%" : "-",
      amount: isConnected ? "$1,664" : "-",
      color: "var(--violet-11)",
    },
  };

  return {
    isConnected,
    assetData,
    yieldData,
    vaultData,
  };
};

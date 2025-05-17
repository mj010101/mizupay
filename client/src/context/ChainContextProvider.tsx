import { useMemo, useState } from "react";
import { ChainContext, DEFAULT_CHAIN_CONFIG, SuiRpcUrl } from "./ChainContext";

const STORAGE_KEY = "sui-app:selected-chain";

function getSuiRpcUrl(network: string): SuiRpcUrl {
  switch (network) {
    case "mainnet":
      return "https://fullnode.mainnet.sui.io:443";
    case "testnet":
      return "https://fullnode.testnet.sui.io:443";
    case "localnet":
      return "http://127.0.0.1:9000";
    case "devnet":
    default:
      return "https://fullnode.devnet.sui.io:443";
  }
}

function getSuiExplorerUrl(network: string): string {
  const baseUrl = "https://explorer.sui.io";
  if (network === "localnet") {
    return "http://localhost:8080";
  }
  return `${baseUrl}/txblock?network=${network}`;
}

export function ChainContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chain, setChain] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? "sui:devnet",
  );
  const contextValue = useMemo<ChainContext>(() => {
    switch (chain) {
      case "sui:mainnet":
        return {
          chain: "sui:mainnet",
          displayName: "Sui Mainnet",
          network: "mainnet",
          suiExplorerUrl: getSuiExplorerUrl("mainnet"),
          suiRpcUrl: getSuiRpcUrl("mainnet"),
        };
      case "sui:testnet":
        return {
          chain: "sui:testnet",
          displayName: "Sui Testnet",
          network: "testnet",
          suiExplorerUrl: getSuiExplorerUrl("testnet"),
          suiRpcUrl: getSuiRpcUrl("testnet"),
        };
      case "sui:localnet":
        return {
          chain: "sui:localnet",
          displayName: "Sui Localnet",
          network: "localnet",
          suiExplorerUrl: getSuiExplorerUrl("localnet"),
          suiRpcUrl: getSuiRpcUrl("localnet"),
        };
      case "sui:devnet":
      default:
        if (chain !== "sui:devnet") {
          localStorage.removeItem(STORAGE_KEY);
          console.error(`인식할 수 없는 체인 \`${chain}\``);
        }
        return DEFAULT_CHAIN_CONFIG;
    }
  }, [chain]);
  return (
    <ChainContext.Provider
      value={useMemo(
        () => ({
          ...contextValue,
          setChain(chain) {
            localStorage.setItem(STORAGE_KEY, chain);
            setChain(chain);
          },
        }),
        [contextValue],
      )}
    >
      {children}
    </ChainContext.Provider>
  );
}

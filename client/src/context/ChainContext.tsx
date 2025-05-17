import { createContext } from "react";

// Sui 네트워크 유형
export type SuiNetwork = "mainnet" | "testnet" | "devnet" | "localnet";

// Sui RPC URL 유형
export type SuiRpcUrl = `http://${string}` | `https://${string}`;

export type ChainContext = Readonly<{
  chain: `sui:${string}`;
  displayName: string;
  setChain?(chain: `sui:${string}`): void;
  suiExplorerUrl: string;
  suiRpcUrl: SuiRpcUrl;
  network: SuiNetwork;
}>;

// Sui 기본 체인 설정
export const DEFAULT_CHAIN_CONFIG = Object.freeze({
  chain: "sui:devnet",
  displayName: "Sui Devnet",
  network: "devnet",
  suiExplorerUrl: "https://explorer.sui.io/txblock?network=devnet",
  suiRpcUrl: "https://fullnode.devnet.sui.io:443",
});

export const ChainContext = createContext<ChainContext>(DEFAULT_CHAIN_CONFIG);

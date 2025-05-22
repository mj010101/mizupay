export const NETWORK = "testnet";

// TODO: Replace the following values with the actual on-chain object ids once the
// package is deployed to Devnet. You can find them with the Sui CLI or the explorer.
export const PACKAGE_ID =
  "0xb9e2b3e114cbc33707f1279a5d5e415d46f1d70213d121ce8eb6ee8526c8e8fb";
export const CONFIG_ID =
  "0xcd6595d5b5d9ac759c2ba97d7d93b85057b63793f5e29c3ff6916db70a410d14"; // mizupay::config::ZFubaoConfig shared object
export const VAULT_ID =
  "0x2554960a7431a7259c90dde66d5f4b5ce9c2737acc5de4b2e67f0b442ef77538"; // mizupay::vault::Vault shared object

// Coin type strings used by the Sui SDK
export const LBTC_TYPE = `${PACKAGE_ID}::lbtc::LBTC`;
export const MZUSD_TYPE = `${PACKAGE_ID}::mzusd::MZUSD`;
export const SMZUSD_TYPE = `${PACKAGE_ID}::smzusd::SMZUSD`;

// RPC URL helper (always devnet for now)
import { getFullnodeUrl } from "@mysten/sui/client";
export const FULLNODE_URL = getFullnodeUrl(NETWORK);

export const SUI_CLOCK_ID = "0x6";
export const PYTH_PRICE_ID_BTCUSD =
  "0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b";

export const WORMHOLE_STATE_ID =
  "0x31358d198147da50db32eda2562951d53973a0c0ad5ed738e9b17d88b213d790";
export const PYTH_STATE_ID =
  "0x243759059f4c3111179da5878c12f68d612c21a8d54d85edc86164bb18be1c7c";

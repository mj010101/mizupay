export const NETWORK = "testnet";

// TODO: Replace the following values with the actual on-chain object ids once the
// package is deployed to Devnet. You can find them with the Sui CLI or the explorer.
export const PACKAGE_ID =
  "0xdf2ac204ef758ae05809c7171716f5ded8e6182a3f37c71473d69e4444bdcbd7";
export const CONFIG_ID =
  "0xce5a3bc8d0083ecdfba02bd4078fb37fca8ef7a84b3d361e549662589d72d0d8"; // mizupay::config::ZFubaoConfig shared object
export const VAULT_ID =
  "0xc574684ea6e52344d528cba2329d6684769d399a4c6a7090cc10455664bf7e04"; // mizupay::vault::Vault shared object

// Coin type strings used by the Sui SDK
export const LBTC_TYPE = `${PACKAGE_ID}::lbtc::LBTC`;
export const MZUSD_TYPE = `${PACKAGE_ID}::mzusd::MZUSD`;
export const SMZUSD_TYPE = `${PACKAGE_ID}::smzusd::SMZUSD`;

// RPC URL helper (always devnet for now)
import { getFullnodeUrl } from "@mysten/sui/client";
export const FULLNODE_URL = getFullnodeUrl(NETWORK);

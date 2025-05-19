export const NETWORK = "devnet";

// TODO: Replace the following values with the actual on-chain object ids once the
// package is deployed to Devnet. You can find them with the Sui CLI or the explorer.
export const PACKAGE_ID = "<PASTE_PACKAGE_ID_HERE>";
export const CONFIG_ID = "<PASTE_CONFIG_OBJECT_ID_HERE>"; // z_fubao::config::ZFubaoConfig shared object
export const VAULT_ID = "<PASTE_VAULT_OBJECT_ID_HERE>"; // z_fubao::vault::Vault shared object

// Coin type strings used by the Sui SDK
export const LBTC_TYPE = `${PACKAGE_ID}::lbtc::LBTC`;
export const ZUSD_TYPE = `${PACKAGE_ID}::zusd::ZUSD`;
export const SZUSD_TYPE = `${PACKAGE_ID}::szusd::SZUSD`;

// RPC URL helper (always devnet for now)
import { getFullnodeUrl } from "@mysten/sui/client";
export const FULLNODE_URL = getFullnodeUrl(NETWORK);

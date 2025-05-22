export const NETWORK = "testnet";

// TODO: Replace the following values with the actual on-chain object ids once the
// package is deployed to Devnet. You can find them with the Sui CLI or the explorer.
export const PACKAGE_ID =
  "0xc382c6d780d654b080bdc16609336ebe15e46a165f65601b388f77e99fb33279";
export const CONFIG_ID =
  "0xc5f9f782a3a9f83107d74bc19d4feae578f556118a36f87df1dbcc886336ecae"; // mizupay::config::ZFubaoConfig shared object
export const VAULT_ID =
  "0x97415cb23af718bf10c61743c35b718a2da855c2f92394714495325745162587"; // mizupay::vault::Vault shared object

// Coin type strings used by the Sui SDK
export const LBTC_TYPE = `${PACKAGE_ID}::lbtc::LBTC`;
export const MZUSD_TYPE = `${PACKAGE_ID}::mzusd::MZUSD`;
export const SMZUSD_TYPE = `${PACKAGE_ID}::smzusd::SMZUSD`;

// RPC URL helper (always devnet for now)
import { getFullnodeUrl } from "@mysten/sui/client";
export const FULLNODE_URL = getFullnodeUrl(NETWORK);

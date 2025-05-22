import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "./suiClient";
import {
  CONFIG_ID,
  VAULT_ID,
  PACKAGE_ID,
  LBTC_TYPE,
  MZUSD_TYPE,
} from "../suiConfig";

// Read the BTC price (LBTC price in MZUSD) from the on-chain config object.
export async function fetchOnchainBTCPrice(): Promise<number | null> {
  try {
    const obj = await suiClient.getObject({
      id: CONFIG_ID,
      options: {
        showContent: true,
      },
    });

    if (obj.data && obj.data.content && "fields" in obj.data.content) {
      // price is stored in the `lbtc_price_in_mzusd` field as a u64.
      const priceStr = (obj.data.content as any).fields
        .lbtc_price_in_mzusd as string;
      const price = Number(priceStr);
      return price;
    }
    return null;
  } catch (e) {
    console.error("failed to fetch on-chain price", e);
    return null;
  }
}

// Helper to build a tx block that deposits LBTC collateral and borrows MZUSD.
export async function buildDepositAndBorrowTx(
  ownerAddress: string,
  lbtcAmountDecimal: number,
  borrowAmountDecimal: number
): Promise<Transaction> {
  // Convert decimals to on-chain smallest units (assuming 9 decimals)
  const lbtcAmount = Math.floor(lbtcAmountDecimal * 1e9);
  const borrowAmount = Math.floor(borrowAmountDecimal * 1e9);

  // Fetch a coin object that has enough LBTC balance.
  const coins = await suiClient.getCoins({
    owner: ownerAddress,
    coinType: LBTC_TYPE,
  });
  if (!coins.data.length) {
    throw new Error("No LBTC coins found for address");
  }

  // Pick first coin with sufficient balance
  const suitableCoin = coins.data.find(
    (c) => BigInt(c.balance) >= BigInt(lbtcAmount)
  );

  if (!suitableCoin) {
    throw new Error("Insufficient LBTC balance for the requested amount");
  }

  const txb = new Transaction();

  const originalCoin = txb.object(suitableCoin.coinObjectId);

  // Split out the exact amount needed so we only deposit the requested size
  const depositCoin = txb.splitCoins(originalCoin, [txb.pure.u64(lbtcAmount)]);

  // deposit_collateral(
  //   _config: &MizuPayConfig,
  //   vault: &mut Vault,
  //   lbtc_coin: Coin<LBTC>,
  //   amount: u64,
  //   ctx: &mut TxContext
  // )
  txb.moveCall({
    target: `${PACKAGE_ID}::lending::deposit_collateral`,
    arguments: [
      txb.object(CONFIG_ID),
      txb.object(VAULT_ID),
      depositCoin,
      txb.pure.u64(lbtcAmount),
    ],
  });

  // borrow(
  //   config: &MizuPayConfig,
  //   vault: &mut Vault,
  //   amount: u64,
  //   ctx: &mut TxContext
  // )
  txb.moveCall({
    target: `${PACKAGE_ID}::lending::borrow`,
    arguments: [
      txb.object(CONFIG_ID),
      txb.object(VAULT_ID),
      txb.pure.u64(borrowAmount),
    ],
  });

  txb.setGasBudget(100000000); // adjust as needed

  return txb;
}

// Read the SMZUSD price ratio (scaled by 1e4) from the on-chain config object.
export async function fetchSMZUSDPriceRatio(): Promise<number | null> {
  try {
    const obj = await suiClient.getObject({
      id: CONFIG_ID,
      options: {
        showContent: true,
      },
    });

    if (obj.data && obj.data.content && "fields" in obj.data.content) {
      const ratioStr = (obj.data.content as any).fields
        .smzusd_price_ratio as string;
      const ratio = Number(ratioStr);
      return ratio;
    }
    return null;
  } catch (e) {
    console.error("failed to fetch SMZUSD price ratio", e);
    return null;
  }
}

// Build a transaction that stakes MZUSD and receives sMZUSD (SMZUSD).
export async function buildStakeTx(
  ownerAddress: string,
  mzusdAmountDecimal: number
): Promise<Transaction> {
  // Convert to on-chain smallest unit (assuming 9 decimals)
  const mzusdAmount = Math.floor(mzusdAmountDecimal * 1e9);

  // Find a MZUSD coin with enough balance
  const coins = await suiClient.getCoins({
    owner: ownerAddress,
    coinType: MZUSD_TYPE,
  });

  if (!coins.data.length) {
    throw new Error("No MZUSD coins found for address");
  }

  // Pick first coin with sufficient balance
  const suitableCoin = coins.data.find(
    (c) => BigInt(c.balance) >= BigInt(mzusdAmount)
  );

  if (!suitableCoin) {
    throw new Error("Insufficient MZUSD balance for the requested amount");
  }

  // Check if the user has an existing staking position
  let hasStakingPosition = false;
  try {
    // Query the staking position by checking the vault object
    const vaultObj = await suiClient.getObject({
      id: VAULT_ID,
      options: {
        showContent: true,
      },
    });

    if (
      vaultObj.data &&
      vaultObj.data.content &&
      "fields" in vaultObj.data.content
    ) {
      const stakingPositionMapping = (vaultObj.data.content as any).fields
        .staking_position_mapping;
      // Check if the user address exists in the staking position mapping
      if (
        stakingPositionMapping &&
        stakingPositionMapping.fields &&
        stakingPositionMapping.fields.contents
      ) {
        // The contents field is an array of key-value pairs
        const contents = stakingPositionMapping.fields.contents;
        for (const kvPair of contents) {
          if (kvPair[0] === ownerAddress) {
            hasStakingPosition = true;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking staking position:", error);
    // If we can't determine, we'll try to create one anyway
  }

  const txb = new Transaction();

  // Only call open_staking_position if the user doesn't have a staking position
  if (!hasStakingPosition) {
    txb.moveCall({
      target: `${PACKAGE_ID}::staking::open_staking_position`,
      arguments: [txb.object(CONFIG_ID), txb.object(VAULT_ID)],
    });
  }

  const originalCoin = txb.object(suitableCoin.coinObjectId);

  // Split out the exact amount needed so we only stake the requested size
  const stakeCoin = txb.splitCoins(originalCoin, [txb.pure.u64(mzusdAmount)]);

  // stake(
  //   _config: &MizuPayConfig,
  //   vault: &mut Vault,
  //   mzusd_coin: Coin<MZUSD>,
  //   ctx: &mut TxContext
  // )
  txb.moveCall({
    target: `${PACKAGE_ID}::staking::stake`,
    arguments: [txb.object(CONFIG_ID), txb.object(VAULT_ID), stakeCoin],
  });

  txb.setGasBudget(100000000);

  return txb;
}

// Build a transaction that unstakes sMZUSD to receive MZUSD back.
export async function buildUnstakeTx(
  unstakeAmountDecimal: number
): Promise<Transaction> {
  const unstakeAmount = Math.floor(unstakeAmountDecimal * 1e9);

  const txb = new Transaction();

  // unstake(
  //   _config: &MizuPayConfig,
  //   vault: &mut Vault,
  //   amount: u64,
  //   ctx: &mut TxContext
  // )
  txb.moveCall({
    target: `${PACKAGE_ID}::staking::unstake`,
    arguments: [
      txb.object(CONFIG_ID),
      txb.object(VAULT_ID),
      txb.pure.u64(unstakeAmount),
    ],
  });

  txb.setGasBudget(100000000);

  return txb;
}

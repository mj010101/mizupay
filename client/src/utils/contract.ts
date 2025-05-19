import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "./suiClient";
import {
  CONFIG_ID,
  VAULT_ID,
  PACKAGE_ID,
  LBTC_TYPE,
  ZUSD_TYPE,
} from "../suiConfig";

// Read the BTC price (ZBTC price in ZUSD) from the on-chain config object.
export async function fetchOnchainBTCPrice(): Promise<number | null> {
  try {
    const obj = await suiClient.getObject({
      id: CONFIG_ID,
      options: {
        showContent: true,
      },
    });

    if (obj.data && obj.data.content && "fields" in obj.data.content) {
      // price is stored in the `zbtc_price_in_zusd` field as a u64.
      const priceStr = (obj.data.content as any).fields
        .zbtc_price_in_zusd as string;
      const price = Number(priceStr);
      return price;
    }
    return null;
  } catch (e) {
    console.error("failed to fetch on-chain price", e);
    return null;
  }
}

// Helper to build a tx block that deposits LBTC collateral and borrows ZUSD.
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

  const { coinObjectId, balance } = coins.data[0];
  if (BigInt(balance) < BigInt(lbtcAmount)) {
    throw new Error("Insufficient LBTC balance for the requested amount");
  }

  const txb = new Transaction();

  const coin = txb.object(coinObjectId);

  // deposit_collateral(
  //   _config: &ZFubaoConfig,
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
      coin,
      txb.pure.u64(lbtcAmount),
    ],
  });

  // borrow(
  //   config: &ZFubaoConfig,
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

// Read the SZUSD price ratio (scaled by 1e4) from the on-chain config object.
export async function fetchSZUSDPriceRatio(): Promise<number | null> {
  try {
    const obj = await suiClient.getObject({
      id: CONFIG_ID,
      options: {
        showContent: true,
      },
    });

    if (obj.data && obj.data.content && "fields" in obj.data.content) {
      const ratioStr = (obj.data.content as any).fields
        .szusd_price_ratio as string;
      const ratio = Number(ratioStr);
      return ratio;
    }
    return null;
  } catch (e) {
    console.error("failed to fetch SZUSD price ratio", e);
    return null;
  }
}

// Build a transaction that stakes ZUSD and receives sZUSD (SZUSD).
export async function buildStakeTx(
  ownerAddress: string,
  zusdAmountDecimal: number
): Promise<Transaction> {
  // Convert to on-chain smallest unit (assuming 9 decimals)
  const zusdAmount = Math.floor(zusdAmountDecimal * 1e9);

  // Find a ZUSD coin with enough balance
  const coins = await suiClient.getCoins({
    owner: ownerAddress,
    coinType: ZUSD_TYPE,
  });

  if (!coins.data.length) {
    throw new Error("No ZUSD coins found for address");
  }

  // Pick first coin with sufficient balance
  const suitableCoin = coins.data.find(
    (c) => BigInt(c.balance) >= BigInt(zusdAmount)
  );

  if (!suitableCoin) {
    throw new Error("Insufficient ZUSD balance for the requested amount");
  }

  const txb = new Transaction();

  const originalCoin = txb.object(suitableCoin.coinObjectId);

  // Split out the exact amount needed so we only stake the requested size
  const stakeCoin = txb.splitCoins(originalCoin, [txb.pure.u64(zusdAmount)]);

  // stake(
  //   _config: &ZFubaoConfig,
  //   vault: &mut Vault,
  //   zusd_coin: Coin<ZUSD>,
  //   ctx: &mut TxContext
  // )
  txb.moveCall({
    target: `${PACKAGE_ID}::z_fubao::stake`,
    arguments: [txb.object(CONFIG_ID), txb.object(VAULT_ID), stakeCoin],
  });

  txb.setGasBudget(100000000);

  return txb;
}

// Build a transaction that unstakes sZUSD to receive ZUSD back.
export async function buildUnstakeTx(
  unstakeAmountDecimal: number
): Promise<Transaction> {
  const unstakeAmount = Math.floor(unstakeAmountDecimal * 1e9);

  const txb = new Transaction();

  // unstake(
  //   _config: &ZFubaoConfig,
  //   vault: &mut Vault,
  //   amount: u64,
  //   ctx: &mut TxContext
  // )
  txb.moveCall({
    target: `${PACKAGE_ID}::z_fubao::unstake`,
    arguments: [
      txb.object(CONFIG_ID),
      txb.object(VAULT_ID),
      txb.pure.u64(unstakeAmount),
    ],
  });

  txb.setGasBudget(100000000);

  return txb;
}

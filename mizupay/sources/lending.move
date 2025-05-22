module mizupay::lending {
    // Error codes
    use pyth::price_info::PriceInfoObject;
    use mizupay::pyth_util;
    use mizupay::config::MizuPayConfig;
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use sui::balance::{Self};
    use sui::clock::Clock;
    use mizupay::lbtc::LBTC;
    use mizupay::mzusd::MZUSD;
    use mizupay::vault::Vault;
    use mizupay::vault::Obligation;
    
    const EINSUFFICIENT_COLLATERAL: u64 = 1;
    const EINSUFFICIENT_BALANCE: u64 = 2;
    const EINVALID_AMOUNT: u64 = 3;
    const EINSUFFICIENT_LBTC_IN_VAULT: u64 = 4;
    // Events
    public struct DepositEvent has copy, drop {
        user: address,
        amount: u64,
    }

    public struct WithdrawEvent has copy, drop {
        user: address,
        amount: u64,
    }

    public struct BorrowEvent has copy, drop {
        user: address,
        amount: u64,
    }

    public struct RepayEvent has copy, drop {
        user: address,
        amount: u64,
    }
    
    // Lending functions
    public entry fun deposit_collateral(
        _config: &MizuPayConfig,
        vault: &mut Vault,
        lbtc_coin: Coin<LBTC>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, EINVALID_AMOUNT);
        assert!(coin::value(&lbtc_coin) >= amount, EINSUFFICIENT_BALANCE);

        let obligation = vault.get_or_create_obligation(ctx);
        let lbtc_deposit_amount = obligation.lbtc_deposit_mut();
        *lbtc_deposit_amount = *lbtc_deposit_amount + amount;

        let vault_lbtc_balance = vault.get_mut_lbtc_balance();
        balance::join(vault_lbtc_balance, lbtc_coin.into_balance());

        
        emit(DepositEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    #[allow(lint(self_transfer))]
    public entry fun withdraw_collateral(
        config: &MizuPayConfig,
        vault: &mut Vault,
        clock: &Clock,
        price_info_object: &PriceInfoObject,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let obligation = vault.get_obligation_mut(ctx);
        assert!(amount > 0, EINVALID_AMOUNT);
        assert!(obligation.lbtc_deposit() >= amount, EINSUFFICIENT_COLLATERAL);

        let max_withdrawable = calculate_max_withdrawable(clock, price_info_object, config, obligation);
        assert!(amount <= max_withdrawable, EINSUFFICIENT_COLLATERAL);

        let lbtc_deposit_amount = obligation.lbtc_deposit_mut();
        *lbtc_deposit_amount = *lbtc_deposit_amount - amount;
        if (*lbtc_deposit_amount == 0) {
            vault.delete_obligation(ctx);
        };

        let vault_lbtc_balance = vault.get_mut_lbtc_balance();
        assert!(balance::value(vault_lbtc_balance) >= amount, EINSUFFICIENT_LBTC_IN_VAULT);
        
        let lbtc_coin = balance::split(vault_lbtc_balance, amount);
        transfer::public_transfer(coin::from_balance(lbtc_coin, ctx), tx_context::sender(ctx));


        emit(WithdrawEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    public entry fun borrow(
        config: &MizuPayConfig,
        vault: &mut Vault,
        clock: &Clock,
        price_info_object: &PriceInfoObject,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(amount > 0, EINVALID_AMOUNT);
        let obligation = vault.get_obligation_mut(ctx);
        
        let max_borrowable = calculate_max_borrowable(clock, price_info_object, config, obligation);
        assert!(amount <= max_borrowable, EINSUFFICIENT_COLLATERAL);

        let mzusd_borrowed_amount = obligation.mzusd_borrowed_mut();
        *mzusd_borrowed_amount = *mzusd_borrowed_amount + amount;

        mizupay::mzusd::mint(vault.get_mzusd_treasury_cap(), amount, sender, ctx);
        
        emit(BorrowEvent {
            user: sender,
            amount,
        });
    }

    public entry fun repay(
        config: &MizuPayConfig,
        vault: &mut Vault,
        mzusd_coin: &mut Coin<MZUSD>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let obligation = vault.get_obligation_mut(ctx);
        assert!(amount > 0, EINVALID_AMOUNT);
        assert!(coin::value(mzusd_coin) >= amount, EINSUFFICIENT_BALANCE);
        assert!(obligation.mzusd_borrowed() >= amount, EINSUFFICIENT_BALANCE);

        let mzusd_borrowed_amount = obligation.mzusd_borrowed_mut();
        *mzusd_borrowed_amount = *mzusd_borrowed_amount - amount;

        let mzusd_coin_to_repay = coin::split(mzusd_coin, amount, ctx);

        coin::burn(vault.get_mzusd_treasury_cap(), mzusd_coin_to_repay);
        
        emit(RepayEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    // Helper functions
    public(package) fun calculate_max_borrowable(
        clock: &Clock,
        price_info_object: &PriceInfoObject,
        config: &MizuPayConfig,
        obligation: &Obligation,
    ): u64 {
        let padding_ratio = 5;
        let max_borrowable = obligation.lbtc_deposit() as u128 * (pyth_util::get_price(clock, price_info_object) as u128) * ((mizupay::config::get_ltv_ratio(config) - padding_ratio) as u128) / 100;
        let u64_max = (1 as u128) << 64 - 1;

        let mut max_borrowable_u64 = 0;
        if (max_borrowable > u64_max) {
            max_borrowable_u64 = u64_max as u64;
        } else {
            max_borrowable_u64 = max_borrowable as u64;
        };

        if (max_borrowable_u64 > obligation.mzusd_borrowed()) {
            max_borrowable_u64 - obligation.mzusd_borrowed()
        } else {
            0
        }
    }

    public(package) fun calculate_max_withdrawable(
        clock: &Clock,
        price_info_object: &PriceInfoObject,
        config: &MizuPayConfig,
        obligation: &Obligation,
    ): u64 {
        let padding_ratio = 5;
        let current_collateral = obligation.lbtc_deposit();
        let needed_value_for_current_borrow = obligation.mzusd_borrowed() * 100 / (mizupay::config::get_ltv_ratio(config) as u64 - padding_ratio);
        let needed_collateral_amount = needed_value_for_current_borrow / pyth_util::get_price(clock, price_info_object);
        if (current_collateral > needed_collateral_amount) {
            current_collateral - needed_collateral_amount
        } else {
            0
        }
    }
}
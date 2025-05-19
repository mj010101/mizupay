module z_fubao::lending {
    // Error codes
    use z_fubao::config::ZFubaoConfig;
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use sui::balance::{Self};
    use z_fubao::lbtc::LBTC;
    use z_fubao::zusd::ZUSD;
    use z_fubao::vault::Vault;
    use z_fubao::vault::Obligation;
    use std::debug::print;
    
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
        _config: &ZFubaoConfig,
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
        config: &ZFubaoConfig,
        vault: &mut Vault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let obligation = vault.get_obligation_mut(ctx);
        assert!(amount > 0, EINVALID_AMOUNT);
        assert!(obligation.lbtc_deposit() >= amount, EINSUFFICIENT_COLLATERAL);

        let max_withdrawable = calculate_max_withdrawable(config, obligation);
        assert!(amount <= max_withdrawable, EINSUFFICIENT_COLLATERAL);

        let lbtc_deposit_amount = obligation.lbtc_deposit_mut();
        *lbtc_deposit_amount = *lbtc_deposit_amount - amount;
        if (*lbtc_deposit_amount == 0) {
            vault.delete_obligation(ctx);
        };

        let vault_lbtc_balance = vault.get_mut_lbtc_balance();
        assert!(balance::value(vault_lbtc_balance) >= amount, EINSUFFICIENT_LBTC_IN_VAULT);
        
        let lbtc_coin = balance::split(vault_lbtc_balance, amount);
        transfer::public_transfer(lbtc_coin.into_coin(ctx), tx_context::sender(ctx));


        emit(WithdrawEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    public entry fun borrow(
        config: &ZFubaoConfig,
        vault: &mut Vault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(amount > 0, EINVALID_AMOUNT);
        let obligation = vault.get_obligation_mut(ctx);
        
        let max_borrowable = calculate_max_borrowable(config, obligation);
        assert!(amount <= max_borrowable, EINSUFFICIENT_COLLATERAL);

        let zusd_borrowed_amount = obligation.zusd_borrowed_mut();
        *zusd_borrowed_amount = *zusd_borrowed_amount + amount;

        coin::mint_and_transfer(vault.get_zusd_treasury_cap(), amount, sender, ctx);
        
        emit(BorrowEvent {
            user: sender,
            amount,
        });
    }

    public entry fun repay(
        _config: &ZFubaoConfig,
        vault: &mut Vault,
        zusd_coin: &mut Coin<ZUSD>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let obligation = vault.get_obligation_mut(ctx);
        assert!(amount > 0, EINVALID_AMOUNT);
        assert!(coin::value(zusd_coin) >= amount, EINSUFFICIENT_BALANCE);
        assert!(obligation.zusd_borrowed() >= amount, EINSUFFICIENT_BALANCE);

        let zusd_borrowed_amount = obligation.zusd_borrowed_mut();
        *zusd_borrowed_amount = *zusd_borrowed_amount - amount;

        let zusd_coin_to_repay = coin::split(zusd_coin, amount, ctx);

        coin::burn(vault.get_zusd_treasury_cap(), zusd_coin_to_repay);
        
        emit(RepayEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    // Helper functions
    public(package) fun calculate_max_borrowable(
        config: &ZFubaoConfig,
        obligation: &Obligation,
    ): u64 {
        let padding_ratio = 5;
        let collateral_value = obligation.lbtc_deposit() * z_fubao::config::get_zbtc_price(config);
        let max_borrowable = (collateral_value * ((z_fubao::config::get_ltv_ratio(config) as u64) - padding_ratio)) / 100;
        max_borrowable - obligation.zusd_borrowed()
    }

    public(package) fun calculate_max_withdrawable(
        config: &ZFubaoConfig,
        obligation: &Obligation,
    ): u64 {
        let padding_ratio = 5;
        let current_collateral = obligation.lbtc_deposit();
        let needed_value_for_current_borrow = obligation.zusd_borrowed() * 100 / (z_fubao::config::get_ltv_ratio(config) as u64 - padding_ratio);
        let needed_collateral_amount = needed_value_for_current_borrow / z_fubao::config::get_zbtc_price(config);
        if (current_collateral > needed_collateral_amount) {
            current_collateral - needed_collateral_amount
        } else {
            0
        }
    }
}
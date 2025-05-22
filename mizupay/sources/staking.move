module mizupay::staking {
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use mizupay::config::{MizuPayConfig};
    use sui::balance;
    use mizupay::mzusd::MZUSD;
    use mizupay::vault::Vault;
    use mizupay::smzusd::SMZUSD;
    use sui::config;
    use mizupay::config::get_smzusd_price_ratio;
    use std::uq32_32;
    use std::debug::print;

    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EINVALID_AMOUNT: u64 = 2;
    const EINSUFFICIENT_MZUSD_IN_VAULT: u64 = 3;

    public struct OpenStakingPositionEvent has copy, drop {
        user: address,
    }

    public struct CloseStakingPositionEvent has copy, drop {
        user: address,
    }

    public struct StakeEvent has copy, drop {
        user: address,
        amount: u64,
    }

    public struct UnstakeEvent has copy, drop {
        user: address,
        amount: u64,
    }

    public entry fun open_staking_position(
        _config: &MizuPayConfig,
        vault: &mut Vault,
        ctx: &mut TxContext
    ) {
        vault.create_staking_position(ctx);

        emit(OpenStakingPositionEvent {
            user: tx_context::sender(ctx),
        });
    }

    public entry fun close_staking_position(
        config: &MizuPayConfig,
        vault: &mut Vault,
        smzusd_coin: Coin<SMZUSD>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&smzusd_coin);
        let staking_amount = vault.get_staking_position(ctx).staked_amount();
        assert!(amount == staking_amount, EINVALID_AMOUNT);

        user_withdraw_mzusd(vault, staking_amount,  config, ctx);
        coin::burn(vault.get_smzusd_treasury_cap(), smzusd_coin);
        vault.delete_staking_position(ctx);

        emit(CloseStakingPositionEvent {
            user: tx_context::sender(ctx),
        });
    }

    // Staking functions
    public entry fun stake(
        _config: &MizuPayConfig,
        vault: &mut Vault,
        mzusd_coin: Coin<MZUSD>,
        ctx: &mut TxContext
    ) {

        let amount = coin::value(&mzusd_coin);
        assert!(amount > 0, EINVALID_AMOUNT);

        let staking_position = vault.get_staking_position_mut(ctx);
        let staked_amount = staking_position.staked_amount_mut();
        *staked_amount = *staked_amount + amount;

        let vault_mzusd_balance = vault.get_mut_mzusd_balance();
        balance::join(vault_mzusd_balance, mzusd_coin.into_balance());

        mizupay::smzusd::mint(vault.get_smzusd_treasury_cap(), amount, tx_context::sender(ctx), ctx);

        emit(StakeEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    public entry fun unstake(
        config: &MizuPayConfig,
        vault: &mut Vault,
        smzusd_coin: Coin<SMZUSD>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&smzusd_coin);
        let staking_amount = vault.get_staking_position(ctx).staked_amount();
        assert!(amount > 0, EINVALID_AMOUNT);
        assert!(amount <= staking_amount, EINSUFFICIENT_BALANCE);

        user_withdraw_mzusd(vault, amount, config, ctx);
        coin::burn(vault.get_smzusd_treasury_cap(), smzusd_coin);

        emit(UnstakeEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    #[allow(lint(self_transfer))]
    fun user_withdraw_mzusd(
        vault: &mut Vault,
        amount: u64,
        config: &MizuPayConfig,
        ctx: &mut TxContext
    ) {
        let staking_position = vault.get_staking_position_mut(ctx);
        assert!(amount <= staking_position.staked_amount(), EINSUFFICIENT_BALANCE);

        let staked_amount = staking_position.staked_amount_mut();
        *staked_amount = *staked_amount - amount;

        let vault_mzusd_balance = vault.get_mut_mzusd_balance();
        assert!(balance::value(vault_mzusd_balance) >= amount, EINSUFFICIENT_MZUSD_IN_VAULT);
        let interest_amount = amount * get_smzusd_price_ratio(config) / 1_000_000_000;
        let mzusd_coin = balance::split(vault_mzusd_balance, amount).into_coin(ctx);
        transfer::public_transfer(mzusd_coin, ctx.sender());
        mizupay::mzusd::mint(vault.get_mzusd_treasury_cap(), interest_amount, ctx.sender(), ctx);
    }

}
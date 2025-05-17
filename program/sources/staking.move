module z_fubao::z_fubao {
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use z_fubao::config::{ZFubaoConfig};
    use sui::balance;
    use z_fubao::zusd::ZUSD;
    use z_fubao::vault::Vault;

    const EINSUFFICIENT_BALANCE: u64 = 1;
    const EINVALID_AMOUNT: u64 = 2;
    const EINSUFFICIENT_ZUSD_IN_VAULT: u64 = 3;

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

    public fun open_staking_position(
        _config: &ZFubaoConfig,
        vault: &mut Vault,
        ctx: &mut TxContext
    ) {
        vault.create_staking_position(ctx);

        emit(OpenStakingPositionEvent {
            user: tx_context::sender(ctx),
        });
    }

    public fun close_staking_position(
        _config: &ZFubaoConfig,
        vault: &mut Vault,
        ctx: &mut TxContext
    ) {
        let staking_position = vault.get_staking_position(ctx);
        user_withdraw_zusd(vault, staking_position.staked_amount(), ctx);
        vault.delete_staking_position(ctx);

        emit(CloseStakingPositionEvent {
            user: tx_context::sender(ctx),
        });
    }

    // Staking functions
    public fun stake(
        _config: &ZFubaoConfig,
        vault: &mut Vault,
        zusd_coin: Coin<ZUSD>,
        ctx: &mut TxContext
    ) {

        let amount = coin::value(&zusd_coin);
        assert!(amount > 0, EINVALID_AMOUNT);

        let staking_position = vault.get_staking_position_mut(ctx);
        let staked_amount = staking_position.staked_amount_mut();
        *staked_amount = *staked_amount + amount;

        let zusd_balance = vault.get_mut_zusd_balance();
        balance::join(zusd_balance, zusd_coin.into_balance());


        emit(StakeEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    public fun unstake(
        _config: &ZFubaoConfig,
        vault: &mut Vault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, EINVALID_AMOUNT);

        user_withdraw_zusd(vault,  amount, ctx);

        emit(UnstakeEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    #[allow(lint(self_transfer))]
    fun user_withdraw_zusd(
        vault: &mut Vault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let staking_position = vault.get_staking_position_mut(ctx);
        assert!(amount <= staking_position.staked_amount(), EINSUFFICIENT_BALANCE);

        let staked_amount = staking_position.staked_amount_mut();
        *staked_amount = *staked_amount - amount;

        let zusd_balance = vault.get_mut_zusd_balance();
        assert!(balance::value(zusd_balance) >= amount, EINSUFFICIENT_ZUSD_IN_VAULT);

        let zusd_coin = balance::split(zusd_balance, amount).into_coin(ctx);
        transfer::public_transfer(zusd_coin, ctx.sender());
    }

}
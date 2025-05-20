module mizupay::staking {
    use sui::coin::{Self, Coin};
    use sui::event::emit;
    use mizupay::config::{MizuPayConfig};
    use sui::balance;
    use mizupay::mzusd::MZUSD;
    use mizupay::vault::Vault;

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
        _config: &MizuPayConfig,
        vault: &mut Vault,
        ctx: &mut TxContext
    ) {
        let staking_position = vault.get_staking_position(ctx);
        user_withdraw_mzusd(vault, staking_position.staked_amount(), ctx);
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

        let mzusd_balance = vault.get_mut_mzusd_balance();
        balance::join(mzusd_balance, mzusd_coin.into_balance());


        emit(StakeEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    public entry fun unstake(
        _config: &MizuPayConfig,
        vault: &mut Vault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, EINVALID_AMOUNT);

        user_withdraw_mzusd(vault, amount, ctx);

        emit(UnstakeEvent {
            user: tx_context::sender(ctx),
            amount,
        });
    }

    #[allow(lint(self_transfer))]
    fun user_withdraw_mzusd(
        vault: &mut Vault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let staking_position = vault.get_staking_position_mut(ctx);
        assert!(amount <= staking_position.staked_amount(), EINSUFFICIENT_BALANCE);

        let staked_amount = staking_position.staked_amount_mut();
        *staked_amount = *staked_amount - amount;

        let mzusd_balance = vault.get_mut_mzusd_balance();
        assert!(balance::value(mzusd_balance) >= amount, EINSUFFICIENT_MZUSD_IN_VAULT);

        let mzusd_coin = balance::split(mzusd_balance, amount).into_coin(ctx);
        transfer::public_transfer(mzusd_coin, ctx.sender());
    }

}
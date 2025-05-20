module mizupay::vault {
    use sui::event::emit;
    use mizupay::lbtc::LBTC;
    use sui::coin::TreasuryCap;
    use mizupay::smzusd::SMZUSD;
    use mizupay::mzusd::MZUSD;
    use sui::balance::Balance;
    use sui::balance;
    use sui::table::{Self, Table};

    const EINVALID_AMOUNT: u64 = 1;
    const EUNAUTHORIZED: u64 = 2;
    const EOBLIGATION_ALREADY_EXISTS: u64 = 3;
    const ESTAKING_POSITION_ALREADY_EXISTS: u64 = 4;
    const EOBLIGATION_NOT_FOUND: u64 = 5;
    const ESTAKING_POSITION_NOT_FOUND: u64 = 6;

    public struct VaultLBTCBalanceUpdatedEvent has copy, drop {
        old_balance: u64,
        new_balance: u64,
    }

    public struct VaultMZUSDBalanceUpdatedEvent has copy, drop {
        old_balance: u64,
        new_balance: u64,
    }

    public struct Obligation has store, drop {
        user: address,
        lbtc_deposit: u64,
        mzusd_borrowed: u64,
    }

    public struct StakingPosition has store, drop {
        user: address,
        staked_amount: u64,
    }

    public struct Vault has key {
        id: UID,
        authority: address,
        
        lbtc_balance: Balance<LBTC>,
        mzusd_balance: Balance<MZUSD>,

        mzusd_treasury_cap: TreasuryCap<MZUSD>,
        smzusd_treasury_cap: TreasuryCap<SMZUSD>,

        obligation_mapping: Table<address, Obligation>,
        staking_position_mapping: Table<address, StakingPosition>,
    }

    public struct VaultCap has key {
        id: UID
    }

    public struct VAULT has drop {}


    fun init(otw: VAULT, ctx: &mut TxContext) {
        // Creating and sending the Publisher object to the sender.
        sui::package::claim_and_keep(otw, ctx);

        // Creating and sending the HouseCap object to the sender.
        let vault_cap = VaultCap {
        id: object::new(ctx)
        };

        transfer::transfer(vault_cap, ctx.sender());
    }

    /// Initialize the configuration with a one-time witness
    public entry fun initialize(
        vault_cap: VaultCap,
        mzusd_treasury_cap: TreasuryCap<MZUSD>,
        smzusd_treasury_cap: TreasuryCap<SMZUSD>,
        ctx: &mut TxContext
    ) {
        let vault = Vault {
            id: object::new(ctx),
            authority: ctx.sender(),
            lbtc_balance: balance::zero(),
            mzusd_balance: balance::zero(),
            mzusd_treasury_cap,
            smzusd_treasury_cap,
            obligation_mapping: table::new(ctx),
            staking_position_mapping: table::new(ctx),
        };

        let VaultCap { id } = vault_cap;
        object::delete(id);

        transfer::share_object(vault);
    }

    public(package) fun deposit_lbtc(vault: &mut Vault, lbtc: Balance<LBTC>, ctx: &mut TxContext) {
        assert!(balance::value(&lbtc) > 0, EINVALID_AMOUNT);
        assert!(ctx.sender() == vault.authority, EUNAUTHORIZED);

        balance::join(&mut vault.lbtc_balance, lbtc);
        emit(VaultLBTCBalanceUpdatedEvent {
            old_balance: balance::value(&vault.lbtc_balance),
            new_balance: balance::value(&vault.lbtc_balance),
        });
    }

    #[allow(lint(self_transfer))]
    public(package) fun withdraw_lbtc(vault: &mut Vault, amount: u64, ctx: &mut TxContext) {
        assert!(amount > 0 && amount <= balance::value(&vault.lbtc_balance), EINVALID_AMOUNT);
        assert!(ctx.sender() == vault.authority, EUNAUTHORIZED);

        let lbtc = balance::split(&mut vault.lbtc_balance, amount);
        transfer::public_transfer(lbtc.into_coin(ctx), ctx.sender());

        emit(VaultLBTCBalanceUpdatedEvent {
            old_balance: balance::value(&vault.lbtc_balance),
            new_balance: balance::value(&vault.lbtc_balance),
        });
    }

    public(package) fun deposit_mzusd(vault: &mut Vault, mzusd: Balance<MZUSD>, ctx: &mut TxContext) {
        assert!(balance::value(&mzusd) > 0, EINVALID_AMOUNT);
        assert!(ctx.sender() == vault.authority, EUNAUTHORIZED);

        balance::join(&mut vault.mzusd_balance, mzusd);
        emit(VaultMZUSDBalanceUpdatedEvent {
            old_balance: balance::value(&vault.mzusd_balance),
            new_balance: balance::value(&vault.mzusd_balance),
        });
    }

    #[allow(lint(self_transfer))]
    public(package) fun withdraw_mzusd(vault: &mut Vault, amount: u64, ctx: &mut TxContext) {
        assert!(amount > 0 && amount <= balance::value(&vault.mzusd_balance), EINVALID_AMOUNT);
        assert!(ctx.sender() == vault.authority, EUNAUTHORIZED);
        
        let mzusd = balance::split(&mut vault.mzusd_balance, amount);
        transfer::public_transfer(mzusd.into_coin(ctx), ctx.sender());

        emit(VaultMZUSDBalanceUpdatedEvent {
            old_balance: balance::value(&vault.mzusd_balance),
            new_balance: balance::value(&vault.mzusd_balance),
        });
    }

    public(package) fun create_obligation(vault: &mut Vault, ctx: &mut TxContext) {
        let sender = ctx.sender();
        assert!(!table::contains(&vault.obligation_mapping, sender), EOBLIGATION_ALREADY_EXISTS);

        let obligation = Obligation {
            user: sender,
            lbtc_deposit: 0,
            mzusd_borrowed: 0,
        };
        table::add(&mut vault.obligation_mapping, sender, obligation);
    }

    public(package) fun get_obligation(vault: &Vault, ctx: &TxContext): &Obligation {
        let sender = ctx.sender();
        assert!(table::contains(&vault.obligation_mapping, sender), EOBLIGATION_NOT_FOUND);
        table::borrow(&vault.obligation_mapping, sender)
    }

    public(package) fun get_obligation_mut(vault: &mut Vault, ctx: &mut TxContext): &mut Obligation {
        let sender = ctx.sender();
        assert!(table::contains(&vault.obligation_mapping, sender), EOBLIGATION_NOT_FOUND);
        table::borrow_mut(&mut vault.obligation_mapping, sender)
    }

    public(package) fun get_or_create_obligation(vault: &mut Vault, ctx: &mut TxContext): &mut Obligation {
        let sender = ctx.sender();
        if (!table::contains(&vault.obligation_mapping, sender)) {
            vault.create_obligation(ctx);
        };
        vault.get_obligation_mut(ctx)
    }

    public(package) fun delete_obligation(vault: &mut Vault, ctx: &mut TxContext) {
        let sender = ctx.sender();
        assert!(table::contains(&vault.obligation_mapping, sender), EOBLIGATION_NOT_FOUND);
        table::remove(&mut vault.obligation_mapping, sender);
    }

    public(package) fun create_staking_position(vault: &mut Vault, ctx: &mut TxContext) {
        let sender = ctx.sender();
        assert!(!table::contains(&vault.staking_position_mapping, sender), ESTAKING_POSITION_ALREADY_EXISTS);
        
        let staking_position = StakingPosition {
            user: sender,
            staked_amount: 0,
        };
        table::add(&mut vault.staking_position_mapping, sender, staking_position);
    }

    public(package) fun get_staking_position(vault: &Vault, ctx: &TxContext): &StakingPosition {
        let sender = ctx.sender();
        assert!(table::contains(&vault.staking_position_mapping, sender), ESTAKING_POSITION_NOT_FOUND);
        table::borrow(&vault.staking_position_mapping, sender)
    }

    public(package) fun get_staking_position_mut(vault: &mut Vault, ctx: &mut TxContext): &mut StakingPosition {
        let sender = ctx.sender();
        assert!(table::contains(&vault.staking_position_mapping, sender), ESTAKING_POSITION_NOT_FOUND);
        table::borrow_mut(&mut vault.staking_position_mapping, sender)
    }

    public(package) fun delete_staking_position(vault: &mut Vault, ctx: &mut TxContext) {
        let sender = ctx.sender();
        assert!(table::contains(&vault.staking_position_mapping, sender), ESTAKING_POSITION_NOT_FOUND);
        table::remove(&mut vault.staking_position_mapping, sender);
    }
    
    public(package) fun get_mzusd_treasury_cap(vault: &mut Vault): &mut TreasuryCap<MZUSD> {
        &mut vault.mzusd_treasury_cap
    }

    public(package) fun get_smzusd_treasury_cap(vault: &mut Vault): &mut TreasuryCap<SMZUSD> {
        &mut vault.smzusd_treasury_cap
    }

    public(package) fun get_mut_lbtc_balance(vault: &mut Vault): &mut Balance<LBTC> {
        &mut vault.lbtc_balance
    }

    public(package) fun get_mut_mzusd_balance(vault: &mut Vault): &mut Balance<MZUSD> {
        &mut vault.mzusd_balance
    }
    
    public(package) fun lbtc_deposit(obligation: &Obligation): u64 {
        obligation.lbtc_deposit
    }

    public(package) fun lbtc_deposit_mut(obligation: &mut Obligation): &mut u64 {
        &mut obligation.lbtc_deposit
    }

    public(package) fun mzusd_borrowed(obligation: &Obligation): u64 {
        obligation.mzusd_borrowed
    }

    public(package) fun mzusd_borrowed_mut(obligation: &mut Obligation): &mut u64 {
        &mut obligation.mzusd_borrowed
    }

    public(package) fun staked_amount(staking_position: &StakingPosition): u64 {
        staking_position.staked_amount
    }

    public(package) fun staked_amount_mut(staking_position: &mut StakingPosition): &mut u64 {
        &mut staking_position.staked_amount
    }

    public(package) fun lbtc_balance(vault: &Vault): &Balance<LBTC> {
        &vault.lbtc_balance
    }

    public(package) fun mzusd_balance(vault: &Vault): &Balance<MZUSD> {
        &vault.mzusd_balance
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(VAULT {}, ctx);
    }
}
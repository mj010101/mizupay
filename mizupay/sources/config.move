module mizupay::config {
    use sui::event::emit;
    use std::string::{Self, String};

    // Error codes
    const EINVALID_LTV: u64 = 1;
    const EINVALID_PRICE: u64 = 2;
    const EUNAUTHORIZED: u64 = 3;

    // Constants
    const MAX_LTV_RATIO: u8 = 75; // 75%

    /// Event emitted when configuration is updated
    public struct ConfigUpdatedEvent has copy, drop {
        field: String,
        old_value: u64,
        new_value: u64,
    }

    /// Configuration object for the MizuPay protocol
    public struct MizuPayConfig has key {
        id: UID,
        authority: address,
        ltv_ratio: u8,
        lbtc_price_in_mzusd: u64,
        smzusd_price_ratio: u64,
    }

    /// A one-time use capability to initialize the config; created and sent
    /// to sender in the initializer.
    public struct ConfigCap has key {
        id: UID
    }

    /// One-time witness type to ensure single config
    public struct CONFIG has drop {}


    fun init(otw: CONFIG, ctx: &mut TxContext) {
        // Creating and sending the Publisher object to the sender.
        sui::package::claim_and_keep(otw, ctx);

        // Creating and sending the HouseCap object to the sender.
        let config_cap = ConfigCap {
        id: object::new(ctx)
        };

        transfer::transfer(config_cap, ctx.sender());
    }

    /// Initialize the configuration with a one-time witness
    public fun initialize(
        config_cap: ConfigCap,
        ltv_ratio: u8,
        lbtc_price_in_mzusd: u64,
        ctx: &mut TxContext
    ) {
        assert!(ltv_ratio <= MAX_LTV_RATIO, EINVALID_LTV);
        assert!(lbtc_price_in_mzusd > 0, EINVALID_PRICE);

        let config = MizuPayConfig {
            id: object::new(ctx),
            authority: ctx.sender(),
            ltv_ratio,
            lbtc_price_in_mzusd,
            smzusd_price_ratio: 1_000_000_000, // 1:1 initial ratio. 9 decimals
        };

        let ConfigCap { id } = config_cap;
        object::delete(id);

        transfer::share_object(config);
    }

    /// Update the LBTC price
    public fun update_price(
        config: &mut MizuPayConfig,
        new_price: u64,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == config.authority, EUNAUTHORIZED);
        assert!(new_price > 0, EINVALID_PRICE);

        let old_price = config.lbtc_price_in_mzusd;
        config.lbtc_price_in_mzusd = new_price;

        emit(ConfigUpdatedEvent {
            field: string::utf8(b"lbtc_price_in_mzusd"),
            old_value: old_price,
            new_value: new_price,
        });
    }

    /// Update the LTV ratio
    public fun update_ltv_ratio(
        config: &mut MizuPayConfig,
        new_ltv_ratio: u8,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == config.authority, EUNAUTHORIZED);
        assert!(new_ltv_ratio <= MAX_LTV_RATIO, EINVALID_LTV);

        let old_ratio = config.ltv_ratio as u64;
        config.ltv_ratio = new_ltv_ratio;

        emit(ConfigUpdatedEvent {
            field: string::utf8(b"ltv_ratio"),
            old_value: old_ratio,
            new_value: new_ltv_ratio as u64,
        });
    }

    /// Update the SMZUSD price ratio
    public fun update_smzusd_price_ratio(
        config: &mut MizuPayConfig,
        new_ratio: u64,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == config.authority, EUNAUTHORIZED);
        assert!(new_ratio > 0, EINVALID_PRICE);

        let old_ratio = config.smzusd_price_ratio;
        config.smzusd_price_ratio = new_ratio;

        emit(ConfigUpdatedEvent {
            field: string::utf8(b"smzusd_price_ratio"),
            old_value: old_ratio,
            new_value: new_ratio,
        });
    }

    /// Get the current LTV ratio
    public(package) fun get_ltv_ratio(config: &MizuPayConfig): u8 {
        config.ltv_ratio
    }

    /// Get the current LBTC price
    public(package) fun get_lbtc_price_in_mzusd(config: &MizuPayConfig): u64 {
        config.lbtc_price_in_mzusd
    }

    /// Get the current SMZUSD price ratio
    public(package) fun get_smzusd_price_ratio(config: &MizuPayConfig): u64 {
        config.smzusd_price_ratio
    }

    /// Get the authority address
    public(package) fun get_authority(config: &MizuPayConfig): address {
        config.authority
    }

    /// Get the maximum LTV ratio
    public(package) fun get_max_ltv_ratio(): u8 {
        MAX_LTV_RATIO
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(CONFIG {}, ctx);
    }
} 
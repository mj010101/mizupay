module z_fubao::config {
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

    /// Configuration object for the ZFubao protocol
    public struct ZFubaoConfig has key {
        id: UID,
        authority: address,
        ltv_ratio: u8,
        zbtc_price_in_zusd: u64,
        szusd_price_ratio: u64,
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
        zbtc_price_in_zusd: u64,
        ctx: &mut TxContext
    ) {
        assert!(ltv_ratio <= MAX_LTV_RATIO, EINVALID_LTV);
        assert!(zbtc_price_in_zusd > 0, EINVALID_PRICE);

        let config = ZFubaoConfig {
            id: object::new(ctx),
            authority: ctx.sender(),
            ltv_ratio,
            zbtc_price_in_zusd,
            szusd_price_ratio: 10000, // 1:1 initial ratio
        };

        let ConfigCap { id } = config_cap;
        object::delete(id);

        transfer::share_object(config);
    }

    /// Update the ZBTC price
    public fun update_price(
        config: &mut ZFubaoConfig,
        new_price: u64,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == config.authority, EUNAUTHORIZED);
        assert!(new_price > 0, EINVALID_PRICE);

        let old_price = config.zbtc_price_in_zusd;
        config.zbtc_price_in_zusd = new_price;

        emit(ConfigUpdatedEvent {
            field: string::utf8(b"zbtc_price_in_zusd"),
            old_value: old_price,
            new_value: new_price,
        });
    }

    /// Update the LTV ratio
    public fun update_ltv_ratio(
        config: &mut ZFubaoConfig,
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

    /// Update the SZUSD price ratio
    public fun update_szusd_price_ratio(
        config: &mut ZFubaoConfig,
        new_ratio: u64,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == config.authority, EUNAUTHORIZED);
        assert!(new_ratio > 0, EINVALID_PRICE);

        let old_ratio = config.szusd_price_ratio;
        config.szusd_price_ratio = new_ratio;

        emit(ConfigUpdatedEvent {
            field: string::utf8(b"szusd_price_ratio"),
            old_value: old_ratio,
            new_value: new_ratio,
        });
    }

    /// Get the current LTV ratio
    public(package) fun get_ltv_ratio(config: &ZFubaoConfig): u8 {
        config.ltv_ratio
    }

    /// Get the current ZBTC price
    public(package) fun get_zbtc_price(config: &ZFubaoConfig): u64 {
        config.zbtc_price_in_zusd
    }

    /// Get the current SZUSD price ratio
    public(package) fun get_szusd_price_ratio(config: &ZFubaoConfig): u64 {
        config.szusd_price_ratio
    }

    /// Get the authority address
    public(package) fun get_authority(config: &ZFubaoConfig): address {
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
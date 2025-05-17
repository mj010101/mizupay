module z_fubao::szusd{

    use sui::coin::{Self, TreasuryCap};

    public struct SZUSD has drop{}

    fun init(otw: SZUSD, ctx: &mut TxContext) {

        // Create SZUSD currency with specified parameters
        let (treasury_cap, metadata) = coin::create_currency<SZUSD>(otw, 9, b"SZUSD", b"SZUSD", b"LST for ZUSD", option::none(), ctx);

        // Freeze the metadata object
        transfer::public_freeze_object(metadata);

         // Transfer treasury cap to contract owner
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint(treasury_cap: &mut TreasuryCap<SZUSD>, amount: u64, recipient: address, ctx: &mut TxContext) {
        
        // Mint and transfer specified amount of tokens from the treasury to the recipient.
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SZUSD {}, ctx);
    }
}
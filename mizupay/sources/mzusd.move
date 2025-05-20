module mizupay::mzusd{

    use sui::coin::{Self, TreasuryCap};

    public struct MZUSD has drop{}

    fun init(otw: MZUSD, ctx: &mut TxContext) {

        // Create MZUSD currency with specified parameters
        let (treasury_cap, metadata) = coin::create_currency<MZUSD>(otw, 9, b"MZUSD", b"MZUSD", b"Stable coin pegged to LBTC", option::none(), ctx);

        // Freeze the metadata object
        transfer::public_freeze_object(metadata);

         // Transfer treasury cap to contract owner
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint(treasury_cap: &mut TreasuryCap<MZUSD>, amount: u64, recipient: address, ctx: &mut TxContext) {
        
        // Mint and transfer specified amount of tokens from the treasury to the recipient.
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(MZUSD {}, ctx);
    }
}
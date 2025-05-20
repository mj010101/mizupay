module mizupay::smzusd{

    use sui::coin::{Self, TreasuryCap};

    public struct SMZUSD has drop{}

    fun init(otw: SMZUSD, ctx: &mut TxContext) {

        // Create SMZUSD currency with specified parameters
        let (treasury_cap, metadata) = coin::create_currency<SMZUSD>(otw, 9, b"SMZUSD", b"SMZUSD", b"LST for MZUSD", option::none(), ctx);

        // Freeze the metadata object
        transfer::public_freeze_object(metadata);

         // Transfer treasury cap to contract owner
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint(treasury_cap: &mut TreasuryCap<SMZUSD>, amount: u64, recipient: address, ctx: &mut TxContext) {
        
        // Mint and transfer specified amount of tokens from the treasury to the recipient.
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(SMZUSD {}, ctx);
    }
}
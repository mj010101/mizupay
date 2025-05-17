module z_fubao::zusd{

    use sui::coin::{Self, TreasuryCap};

    public struct ZUSD has drop{}

    fun init(otw: ZUSD, ctx: &mut TxContext) {

        // Create ZUSD currency with specified parameters
        let (treasury_cap, metadata) = coin::create_currency<ZUSD>(otw, 9, b"ZUSD", b"ZUSD", b"Stable coin pegged to LBTC", option::none(), ctx);

        // Freeze the metadata object
        transfer::public_freeze_object(metadata);

         // Transfer treasury cap to contract owner
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint(treasury_cap: &mut TreasuryCap<ZUSD>, amount: u64, recipient: address, ctx: &mut TxContext) {
        
        // Mint and transfer specified amount of tokens from the treasury to the recipient.
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ZUSD {}, ctx);
    }
}
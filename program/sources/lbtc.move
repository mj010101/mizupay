// TODO: replace with on chain LBTC (current git repo seems buggy)
module z_fubao::lbtc{

    use sui::coin::{Self, TreasuryCap};

    public struct LBTC has drop{}

    fun init(otw: LBTC, ctx: &mut TxContext) {

        // Create LBTC currency with specified parameters
        let (treasury_cap, metadata) = coin::create_currency<LBTC>(otw, 9, b"LBTC", b"LBTC", b"Stable coin pegged to LBTC", option::none(), ctx);

        // Freeze the metadata object
        transfer::public_freeze_object(metadata);

         // Transfer treasury cap to contract owner
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint(treasury_cap: &mut TreasuryCap<LBTC>, amount: u64, recipient: address, ctx: &mut TxContext) {
        
        // Mint and transfer specified amount of tokens from the treasury to the recipient.
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(LBTC {}, ctx);
    }
}
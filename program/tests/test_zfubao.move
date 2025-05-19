#[test_only]
module z_fubao::zfubao_tests;

use sui::test_scenario::{Self as ts};
use z_fubao::config::{Self, ZFubaoConfig, ConfigCap};
use z_fubao::zusd::{Self, ZUSD};
use z_fubao::szusd::{Self, SZUSD};
use z_fubao::vault::{Self, VAULT};
use z_fubao::vault::VaultCap;
use sui::coin::TreasuryCap;
use z_fubao::vault::Vault;
use z_fubao::lbtc::LBTC;
use z_fubao::lending::{Self, calculate_max_borrowable, calculate_max_withdrawable};
use z_fubao::staking;
use sui::coin::Coin;
use std::unit_test::assert_eq;
use std::debug::print;

const ADMIN_USER: address = @0x1;
const USER: address = @0x2;

#[test_only]
fun init_config(scenario: &mut ts::Scenario, ltv_ratio: u8, zbtc_price_in_zusd: u64) {
    config::init_for_testing(scenario.ctx());
    scenario.next_tx(ADMIN_USER);

    let config_cap = ts::take_from_address<ConfigCap>(scenario, ADMIN_USER);


    config::initialize(config_cap, ltv_ratio, zbtc_price_in_zusd, scenario.ctx());

}

#[test_only]
fun init_mint_and_vault(scenario: &mut ts::Scenario) {
    vault::init_for_testing(scenario.ctx());
    zusd::init_for_testing(scenario.ctx());
    szusd::init_for_testing(scenario.ctx());

    scenario.next_tx(ADMIN_USER);

    let vault_cap = ts::take_from_address<VaultCap>(scenario, ADMIN_USER);
    let zusd_treasury_cap = ts::take_from_address<TreasuryCap<ZUSD>>(scenario, ADMIN_USER);
    let szusd_treasury_cap = ts::take_from_address<TreasuryCap<SZUSD>>(scenario, ADMIN_USER);

    vault::initialize(vault_cap, zusd_treasury_cap, szusd_treasury_cap, scenario.ctx());
}

#[test]
fun test_init_and_update_config() {
    let mut scenario_val = ts::begin(ADMIN_USER);
    let scenario = &mut scenario_val;

    let ltv_ratio = 70;
    let zbtc_price_in_zusd = 100000;

    init_config(scenario, ltv_ratio, zbtc_price_in_zusd);

    scenario.next_tx(ADMIN_USER);

    let new_ltv_ratio = 75;
    let new_zbtc_price_in_zusd = 1000000000000000001;
    let new_szusd_price_ratio = 10001;

    {
        let mut config = ts::take_shared<ZFubaoConfig>(scenario);
        assert!(config::get_ltv_ratio(&config) == ltv_ratio, 0);
        assert!(config::get_zbtc_price(&config) == zbtc_price_in_zusd, 0);
        assert!(config::get_authority(&config) == ADMIN_USER, 0);
        assert!(config::get_szusd_price_ratio(&config) == 10000, 0);
        assert!(config::get_max_ltv_ratio() == 75, 0);

        config::update_ltv_ratio(&mut config, new_ltv_ratio, scenario.ctx());
        config::update_price(&mut config, new_zbtc_price_in_zusd, scenario.ctx());
        config::update_szusd_price_ratio(&mut config, new_szusd_price_ratio, scenario.ctx());

        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(ADMIN_USER);

    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        assert!(config::get_ltv_ratio(&config) == new_ltv_ratio, 0);
        assert!(config::get_zbtc_price(&config) == new_zbtc_price_in_zusd, 0);
        assert!(config::get_szusd_price_ratio(&config) == new_szusd_price_ratio, 0);

        ts::return_shared<ZFubaoConfig>(config);
    };

    ts::end(scenario_val);
}

#[test]
fun test_init_vault() {
    let mut scenario_val = ts::begin(ADMIN_USER);
    let scenario = &mut scenario_val;

    init_mint_and_vault(scenario);

    ts::end(scenario_val);
}

#[test]
fun test_lending() {
    let mut scenario_val = ts::begin(ADMIN_USER);
    let scenario = &mut scenario_val;

    let ltv_ratio = 70;
    let zbtc_price_in_zusd = 100000;

    init_config(scenario, ltv_ratio, zbtc_price_in_zusd);
    init_mint_and_vault(scenario);

    let deposit_amount = 100;
    let zusd_borrow_amount;
    let lbtc_coin = sui::coin::mint_for_testing<LBTC>(deposit_amount, scenario.ctx());

    scenario.next_tx(USER);

    // Process Deposit
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        lending::deposit_collateral(&config, &mut vault, lbtc_coin, deposit_amount, scenario.ctx());

        ts::return_shared<ZFubaoConfig>(config);
        ts::return_shared<Vault>(vault);
    };

    scenario.next_tx(USER);

    // Check if applied
    {
        let vault = ts::take_shared<Vault>(scenario);
        let obligation = vault.get_obligation(scenario.ctx());
        assert!(obligation.lbtc_deposit() == deposit_amount, 0);
        assert!(vault::zbtc_balance(&vault).value() == deposit_amount, 0);
        ts::return_shared<Vault>(vault);
    };

    scenario.next_tx(USER);

    // Process Borrow
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        {
            let obligation = vault.get_obligation(scenario.ctx());
            zusd_borrow_amount = calculate_max_borrowable(&config, obligation);
        };
        lending::borrow(&config, &mut vault, zusd_borrow_amount, scenario.ctx());
        {
            let obligation = vault.get_obligation(scenario.ctx());
            let zusd_borrowable_amount_after = calculate_max_borrowable(&config, obligation);
            assert_eq!(zusd_borrowable_amount_after, 0);
            let withdrawable_amount = calculate_max_withdrawable(&config, obligation);
            assert_eq!(withdrawable_amount, 0);
        };  

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(USER);

    // Process Repay Half
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        let mut zusd_coin = ts::take_from_address<Coin<ZUSD>>(scenario, USER);
        lending::repay(&config, &mut vault, &mut zusd_coin, zusd_borrow_amount / 2, scenario.ctx());

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
        ts::return_to_sender(scenario, zusd_coin);
    };

    scenario.next_tx(USER);

    // Check if applied
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let vault = ts::take_shared<Vault>(scenario);
        let obligation = vault.get_obligation(scenario.ctx());
        assert!(obligation.zusd_borrowed() == zusd_borrow_amount / 2, 0);
        assert!(calculate_max_borrowable(&config, obligation) == zusd_borrow_amount / 2, 0);

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(USER);

    // Process Repay All
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        let mut zusd_coin = ts::take_from_address<Coin<ZUSD>>(scenario, USER);
        lending::repay(&config, &mut vault, &mut zusd_coin, zusd_borrow_amount / 2, scenario.ctx());
        
        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
        ts::return_to_sender(scenario, zusd_coin);
    };

    scenario.next_tx(USER);

    // Check if applied
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let vault = ts::take_shared<Vault>(scenario);
        let obligation = vault.get_obligation(scenario.ctx());
        assert!(obligation.zusd_borrowed() == 0, 0);
        assert!(calculate_max_borrowable(&config, obligation) == zusd_borrow_amount, 0);

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(USER);

    // Process Withdraw
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        lending::withdraw_collateral(&config, &mut vault, deposit_amount, scenario.ctx());

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(USER);


    ts::end(scenario_val);
}

#[test]
fun test_staking() {
    let mut scenario_val = ts::begin(ADMIN_USER);
    let scenario = &mut scenario_val;

    let ltv_ratio = 70;
    let zbtc_price_in_zusd = 100000;

    init_config(scenario, ltv_ratio, zbtc_price_in_zusd);
    init_mint_and_vault(scenario);

    let stake_amount = 1000;
    let zusd_coin = sui::coin::mint_for_testing<ZUSD>(stake_amount, scenario.ctx());

    scenario.next_tx(USER);

    // Open staking position
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        staking::open_staking_position(&config, &mut vault, scenario.ctx());

        ts::return_shared<ZFubaoConfig>(config);
        ts::return_shared<Vault>(vault);
    };

    scenario.next_tx(USER);

    // Check if staking position is created
    {
        let vault = ts::take_shared<Vault>(scenario);
        let staking_position = vault.get_staking_position(scenario.ctx());
        assert!(staking_position.staked_amount() == 0, 0);
        ts::return_shared<Vault>(vault);
    };

    scenario.next_tx(USER);

    // Process Stake
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        staking::stake(&config, &mut vault, zusd_coin, scenario.ctx());

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(USER);

    // Check if staked
    {
        let vault = ts::take_shared<Vault>(scenario);
        let staking_position = vault.get_staking_position(scenario.ctx());
        assert!(staking_position.staked_amount() == stake_amount, 0);
        ts::return_shared<Vault>(vault);
    };

    scenario.next_tx(USER);

    // Process Unstake Half
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        staking::unstake(&config, &mut vault, stake_amount / 2, scenario.ctx());

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(USER);

    // Check if unstaked
    {
        let vault = ts::take_shared<Vault>(scenario);
        let staking_position = vault.get_staking_position(scenario.ctx());
        assert!(staking_position.staked_amount() == stake_amount / 2, 0);
        ts::return_shared<Vault>(vault);
    };

    scenario.next_tx(USER);

    // Process Unstake All
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        staking::unstake(&config, &mut vault, stake_amount / 2, scenario.ctx());

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    scenario.next_tx(USER);

    // Check if all unstaked
    {
        let vault = ts::take_shared<Vault>(scenario);
        let staking_position = vault.get_staking_position(scenario.ctx());
        assert!(staking_position.staked_amount() == 0, 0);
        ts::return_shared<Vault>(vault);
    };

    scenario.next_tx(USER);

    // Close staking position
    {
        let config = ts::take_shared<ZFubaoConfig>(scenario);
        let mut vault = ts::take_shared<Vault>(scenario);
        staking::close_staking_position(&config, &mut vault, scenario.ctx());

        ts::return_shared<Vault>(vault);
        ts::return_shared<ZFubaoConfig>(config);
    };

    ts::end(scenario_val);
}
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};
use spl_token::{
    instruction as token_instruction,
    state::{Account as TokenAccount, Mint},
};
use spl_associated_token_account::instruction as associated_token_instruction;
use std::convert::TryInto;

// Declare program entrypoint
entrypoint!(process_instruction);

// Program error types
#[derive(Debug, thiserror::Error)]
pub enum StakingError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    #[error("Insufficient funds")]
    InsufficientFunds,
}

impl From<StakingError> for ProgramError {
    fn from(e: StakingError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

// Instruction enum
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum StakingInstruction {
    /// Stake ZUSD tokens and mint SZUSD tokens
    /// 
    /// Accounts expected:
    /// 0. `[signer]` User's main account
    /// 1. `[writable]` User's ZUSD token account
    /// 2. `[writable]` User's SZUSD token account
    /// 3. `[]` ZUSD mint
    /// 4. `[writable]` SZUSD mint
    /// 5. `[writable]` Staking vault - where ZUSD is stored
    /// 6. `[]` Token program
    /// 7. `[]` System program
    Stake { amount: u64 },

    /// Unstake SZUSD tokens and get back ZUSD tokens
    /// 
    /// Accounts expected:
    /// 0. `[signer]` User's main account
    /// 1. `[writable]` User's ZUSD token account
    /// 2. `[writable]` User's SZUSD token account
    /// 3. `[]` ZUSD mint
    /// 4. `[writable]` SZUSD mint
    /// 5. `[writable]` Staking vault - where ZUSD is stored
    /// 6. `[]` Token program
    /// 7. `[]` System program
    Unstake { amount: u64 },
}

// Program state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct StakingState {
    pub admin: Pubkey,
    pub zusd_mint: Pubkey,
    pub szusd_mint: Pubkey,
    pub staking_vault: Pubkey,
}

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = StakingInstruction::try_from_slice(instruction_data)
        .map_err(|_| StakingError::InvalidInstruction)?;

    match instruction {
        StakingInstruction::Stake { amount } => {
            process_stake(program_id, accounts, amount)
        }
        StakingInstruction::Unstake { amount } => {
            process_unstake(program_id, accounts, amount)
        }
    }
}

// Process stake instruction
fn process_stake(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    let user_account = next_account_info(accounts_iter)?;
    let user_zusd_account = next_account_info(accounts_iter)?;
    let user_szusd_account = next_account_info(accounts_iter)?;
    let zusd_mint = next_account_info(accounts_iter)?;
    let szusd_mint = next_account_info(accounts_iter)?;
    let staking_vault = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Transfer ZUSD from user to staking vault
    let transfer_instruction = token_instruction::transfer(
        token_program.key,
        user_zusd_account.key,
        staking_vault.key,
        user_account.key,
        &[],
        amount,
    )?;

    invoke(
        &transfer_instruction,
        &[
            token_program.clone(),
            user_zusd_account.clone(),
            staking_vault.clone(),
            user_account.clone(),
        ],
    )?;

    // Mint SZUSD to the user
    let mint_instruction = token_instruction::mint_to(
        token_program.key,
        szusd_mint.key,
        user_szusd_account.key,
        &program_id, // Authority is the program
        &[],
        amount,
    )?;

    // To mint tokens, we need to sign with the program
    let (pda, bump_seed) = Pubkey::find_program_address(&[b"mint_authority"], program_id);
    
    // Only the program can mint SZUSD
    invoke_signed(
        &mint_instruction,
        &[
            token_program.clone(),
            szusd_mint.clone(),
            user_szusd_account.clone(),
            user_account.clone(),
        ],
        &[&[b"mint_authority", &[bump_seed]]],
    )?;

    msg!("Successfully staked {} ZUSD and minted {} SZUSD", amount, amount);
    Ok(())
}

// Process unstake instruction
fn process_unstake(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    let user_account = next_account_info(accounts_iter)?;
    let user_zusd_account = next_account_info(accounts_iter)?;
    let user_szusd_account = next_account_info(accounts_iter)?;
    let zusd_mint = next_account_info(accounts_iter)?;
    let szusd_mint = next_account_info(accounts_iter)?;
    let staking_vault = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Burn SZUSD tokens from user
    let burn_instruction = token_instruction::burn(
        token_program.key,
        user_szusd_account.key,
        szusd_mint.key,
        user_account.key,
        &[],
        amount,
    )?;

    invoke(
        &burn_instruction,
        &[
            token_program.clone(),
            user_szusd_account.clone(),
            szusd_mint.clone(),
            user_account.clone(),
        ],
    )?;

    // Transfer ZUSD from staking vault to user
    let (pda, bump_seed) = Pubkey::find_program_address(&[b"vault_authority"], program_id);
    
    let transfer_instruction = token_instruction::transfer(
        token_program.key,
        staking_vault.key,
        user_zusd_account.key,
        &pda, // Authority is the program PDA
        &[],
        amount,
    )?;

    invoke_signed(
        &transfer_instruction,
        &[
            token_program.clone(),
            staking_vault.clone(),
            user_zusd_account.clone(),
        ],
        &[&[b"vault_authority", &[bump_seed]]],
    )?;

    msg!("Successfully unstaked {} SZUSD and returned {} ZUSD", amount, amount);
    Ok(())
}

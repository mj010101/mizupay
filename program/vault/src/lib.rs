// This file should be renamed to lib.rs

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use spl_token::instruction as token_instruction;
use thiserror::Error;

// Define program errors
#[derive(Error, Debug, Copy, Clone)]
pub enum VaultError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    #[error("Not rent exempt")]
    NotRentExempt,
    #[error("Insufficient collateral")]
    InsufficientCollateral,
    #[error("Vault not found")]
    VaultNotFound,
    #[error("Math overflow")]
    MathOverflow,
}

impl From<VaultError> for ProgramError {
    fn from(e: VaultError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

// Program ID
solana_program::declare_id!("Vau1tProgramidXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

// Mock oracle module
mod oracle {
    // In a real implementation, this would fetch from a real oracle
    // For simplicity, we're using a mock value
    pub fn get_btc_usd_price() -> u64 {
        // Mock price: $50,000 per BTC with 6 decimals
        50_000_000_000
    }
}

// Program state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Vault {
    pub owner: Pubkey,
    pub zbtc_mint: Pubkey,
    pub zusd_mint: Pubkey,
    pub zbtc_vault: Pubkey,
    pub locked_zbtc_amount: u64,
    pub minted_zusd_amount: u64,
    pub ltv_ratio: u8, // represented as percentage (70 = 70%)
}

// Instructions that this program can execute
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VaultInstruction {
    /// Initialize a new vault
    ///
    /// Accounts expected:
    /// 0. `[signer]` The account of the person initializing the vault
    /// 1. `[writable]` The vault account
    /// 2. `[]` The ZBTC mint
    /// 3. `[]` The ZUSD mint
    /// 4. `[writable]` The ZBTC vault account
    /// 5. `[]` The token program id
    /// 6. `[]` The system program id
    /// 7. `[]` The rent sysvar
    Initialize,

    /// Deposit ZBTC as collateral and mint ZUSD
    ///
    /// Accounts expected:
    /// 0. `[signer]` The user account
    /// 1. `[writable]` The vault account
    /// 2. `[writable]` User's ZBTC token account
    /// 3. `[writable]` ZBTC vault token account
    /// 4. `[writable]` User's ZUSD token account
    /// 5. `[]` ZUSD mint
    /// 6. `[]` Token program id
    /// 7. `[]` Mint authority (PDA)
    DepositAndMint {
        zbtc_amount: u64,
    },

    /// Repay ZUSD and unlock ZBTC collateral
    ///
    /// Accounts expected:
    /// 0. `[signer]` The user account
    /// 1. `[writable]` The vault account
    /// 2. `[writable]` User's ZUSD token account
    /// 3. `[writable]` ZUSD mint
    /// 4. `[writable]` User's ZBTC token account
    /// 5. `[writable]` ZBTC vault token account
    /// 6. `[]` Token program id
    /// 7. `[]` Mint authority (PDA)
    RepayAndWithdraw {
        zusd_amount: u64,
    },
}

impl VaultInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input.split_first().ok_or(VaultError::InvalidInstruction)?;
        
        Ok(match tag {
            0 => Self::Initialize,
            1 => Self::DepositAndMint {
                zbtc_amount: Self::unpack_amount(rest)?,
            },
            2 => Self::RepayAndWithdraw {
                zusd_amount: Self::unpack_amount(rest)?,
            },
            _ => return Err(VaultError::InvalidInstruction.into()),
        })
    }

    fn unpack_amount(input: &[u8]) -> Result<u64, ProgramError> {
        let amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(VaultError::InvalidInstruction)?;
        Ok(amount)
    }
}

// Program entry point
entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = VaultInstruction::unpack(instruction_data)?;
    
    match instruction {
        VaultInstruction::Initialize => {
            process_initialize(program_id, accounts)
        }
        VaultInstruction::DepositAndMint { zbtc_amount } => {
            process_deposit_and_mint(program_id, accounts, zbtc_amount)
        }
        VaultInstruction::RepayAndWithdraw { zusd_amount } => {
            process_repay_and_withdraw(program_id, accounts, zusd_amount)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let owner = next_account_info(account_info_iter)?;
    let vault_account = next_account_info(account_info_iter)?;
    let zbtc_mint = next_account_info(account_info_iter)?;
    let zusd_mint = next_account_info(account_info_iter)?;
    let zbtc_vault = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let rent_info = next_account_info(account_info_iter)?;
    
    // Check signer
    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Check program ownership
    if vault_account.owner != program_id {
        msg!("Create vault account");
        
        let rent = Rent::from_account_info(rent_info)?;
        let space = std::mem::size_of::<Vault>();
        let lamports = rent.minimum_balance(space);
        
        invoke(
            &system_instruction::create_account(
                owner.key,
                vault_account.key,
                lamports,
                space as u64,
                program_id,
            ),
            &[owner.clone(), vault_account.clone(), system_program.clone()],
        )?;
    }
    
    // Initialize vault data
    let vault = Vault {
        owner: *owner.key,
        zbtc_mint: *zbtc_mint.key,
        zusd_mint: *zusd_mint.key,
        zbtc_vault: *zbtc_vault.key,
        locked_zbtc_amount: 0,
        minted_zusd_amount: 0,
        ltv_ratio: 70, // 70% LTV
    };
    
    vault.serialize(&mut *vault_account.data.borrow_mut())?;
    
    msg!("Vault initialized");
    Ok(())
}

fn process_deposit_and_mint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    zbtc_amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let user = next_account_info(account_info_iter)?;
    let vault_account = next_account_info(account_info_iter)?;
    let user_zbtc = next_account_info(account_info_iter)?;
    let zbtc_vault = next_account_info(account_info_iter)?;
    let user_zusd = next_account_info(account_info_iter)?;
    let zusd_mint = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let mint_authority = next_account_info(account_info_iter)?;
    
    // Check signer
    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load vault data
    let mut vault = Vault::try_from_slice(&vault_account.data.borrow())?;
    
    // Verify vault account
    if vault_account.owner != program_id {
        return Err(VaultError::VaultNotFound.into());
    }
    
    // Transfer ZBTC from user to vault
    invoke(
        &token_instruction::transfer(
            token_program.key,
            user_zbtc.key,
            zbtc_vault.key,
            user.key,
            &[],
            zbtc_amount,
        )?,
        &[
            user_zbtc.clone(),
            zbtc_vault.clone(),
            user.clone(),
            token_program.clone(),
        ],
    )?;
    
    // Get BTC/USD price from mock oracle
    let btc_usd_price = oracle::get_btc_usd_price();
    
    // Calculate ZUSD amount based on 70% LTV
    // ZUSD amount = (ZBTC amount * BTC/USD price * 70%) / 100
    let zusd_amount = (zbtc_amount)
        .checked_mul(btc_usd_price)
        .ok_or(VaultError::MathOverflow)?
        .checked_mul(u64::from(vault.ltv_ratio))
        .ok_or(VaultError::MathOverflow)?
        .checked_div(100)
        .ok_or(VaultError::MathOverflow)?;
    
    // Derive PDA for mint authority
    let (pda, bump_seed) = Pubkey::find_program_address(&[b"vault"], program_id);
    let seeds = &[b"vault", &[bump_seed]];
    
    // Mint ZUSD to user
    invoke_signed(
        &token_instruction::mint_to(
            token_program.key,
            zusd_mint.key,
            user_zusd.key,
            mint_authority.key,
            &[],
            zusd_amount,
        )?,
        &[
            zusd_mint.clone(),
            user_zusd.clone(),
            mint_authority.clone(),
            token_program.clone(),
        ],
        &[seeds],
    )?;
    
    // Update vault state
    vault.locked_zbtc_amount = vault.locked_zbtc_amount.checked_add(zbtc_amount).ok_or(VaultError::MathOverflow)?;
    vault.minted_zusd_amount = vault.minted_zusd_amount.checked_add(zusd_amount).ok_or(VaultError::MathOverflow)?;
    
    // Save updated vault data
    vault.serialize(&mut *vault_account.data.borrow_mut())?;
    
    msg!("Deposited {} ZBTC and minted {} ZUSD", zbtc_amount, zusd_amount);
    Ok(())
}

fn process_repay_and_withdraw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    zusd_amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    let user = next_account_info(account_info_iter)?;
    let vault_account = next_account_info(account_info_iter)?;
    let user_zusd = next_account_info(account_info_iter)?;
    let zusd_mint = next_account_info(account_info_iter)?;
    let user_zbtc = next_account_info(account_info_iter)?;
    let zbtc_vault = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let mint_authority = next_account_info(account_info_iter)?;
    
    // Check signer
    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load vault data
    let mut vault = Vault::try_from_slice(&vault_account.data.borrow())?;
    
    // Verify vault account
    if vault_account.owner != program_id {
        return Err(VaultError::VaultNotFound.into());
    }
    
    // Get BTC/USD price from mock oracle
    let btc_usd_price = oracle::get_btc_usd_price();
    
    // Calculate ZBTC amount based on repaid ZUSD
    // ZBTC amount = (ZUSD amount * 100) / (BTC/USD price * 70%)
    let zbtc_amount = (zusd_amount)
        .checked_mul(100)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(btc_usd_price.checked_mul(u64::from(vault.ltv_ratio)).ok_or(VaultError::MathOverflow)?)
        .ok_or(VaultError::MathOverflow)?;
    
    // Verify we're not withdrawing more than locked
    if zbtc_amount > vault.locked_zbtc_amount {
        return Err(VaultError::InsufficientCollateral.into());
    }
    
    // Derive PDA for mint authority
    let (pda, bump_seed) = Pubkey::find_program_address(&[b"vault"], program_id);
    let seeds = &[b"vault", &[bump_seed]];
    
    // Burn ZUSD tokens
    invoke(
        &token_instruction::burn(
            token_program.key,
            user_zusd.key,
            zusd_mint.key,
            user.key,
            &[],
            zusd_amount,
        )?,
        &[
            user_zusd.clone(),
            zusd_mint.clone(),
            user.clone(),
            token_program.clone(),
        ],
    )?;
    
    // Transfer ZBTC from vault to user
    invoke_signed(
        &token_instruction::transfer(
            token_program.key,
            zbtc_vault.key,
            user_zbtc.key,
            mint_authority.key,
            &[],
            zbtc_amount,
        )?,
        &[
            zbtc_vault.clone(),
            user_zbtc.clone(),
            mint_authority.clone(),
            token_program.clone(),
        ],
        &[seeds],
    )?;
    
    // Update vault state
    vault.locked_zbtc_amount = vault.locked_zbtc_amount.checked_sub(zbtc_amount).ok_or(VaultError::MathOverflow)?;
    vault.minted_zusd_amount = vault.minted_zusd_amount.checked_sub(zusd_amount).ok_or(VaultError::MathOverflow)?;
    
    // Save updated vault data
    vault.serialize(&mut *vault_account.data.borrow_mut())?;
    
    msg!("Repaid {} ZUSD and withdrew {} ZBTC", zusd_amount, zbtc_amount);
    Ok(())
}

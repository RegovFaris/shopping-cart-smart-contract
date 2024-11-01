use anchor_lang::prelude::*;
mod vault;


declare_id!("Ghjt9quQKYs9yHANEUaVHPaBFfmhTECeERSKU9q9SjKa");

#[program]
pub mod shop_cart {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>, bump:u8, min_balance: u64) -> Result<()>{
        vault::initialize_vault(ctx, bump, min_balance)
      }

    pub fn deposit_sol(ctx: Context<DepositSol>, amount:u64) -> Result<()>{
        vault::deposit_sol(ctx, amount)
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount:u64) -> Result<()> {
        vault::withdraw_sol(ctx, amount)
    }

    pub fn pay_sol(ctx: Context<PaySol>, amount:u64) -> Result<()> {
        vault::pay_sol(ctx, amount)
    }

    pub fn refund_sol(ctx: Context<RefundSol>, amount:u64) -> Result<()> {
        vault::refund_sol(ctx, amount)
    }

  //   pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
  //     vault::close_vault(ctx)
  // }
    
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
  #[account(
      init,
      seeds = [b"vault", seller.key().as_ref()],
      bump,
      payer = seller,
      space = 8 + VaultAccount::INIT_SPACE,
  )]
  pub vault: Account<'info, VaultAccount>,
  #[account(
    init,
    seeds = [b"history", vault.key().as_ref()],
    bump,
    payer = seller,
    space = 8 + 8 + 100 * std::mem::size_of::<TransactionData>(), // Adjust space based on expected transactions
)]
pub transaction_history: Account<'info, TransactionHistory>,

  #[account(mut)]
  pub seller: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSol<'info>{
    #[account(mut)]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub transaction_history: Account<'info, TransactionHistory>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct WithdrawSol<'info>{
    #[account(mut)]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub transaction_history: Account<'info, TransactionHistory>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct PaySol<'info>{
  #[account(mut)]
  pub vault: Account<'info, VaultAccount>,
  #[account(mut)]
  pub transaction_history: Account<'info, TransactionHistory>,
  #[account(mut)]
  pub buyer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundSol<'info>{
  #[account(mut)]
  pub vault: Account<'info, VaultAccount>,
  #[account(mut)]
  pub transaction_history: Account<'info, TransactionHistory>,
  #[account(mut)]
  pub buyer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct CloseVault<'info>{
//     #[account(
//       mut, 
//       close = seller,
//     )]
//     pub vault: Account<'info, VaultAccount>,
//     #[account(mut)]
//     pub transaction_history: Account<'info, TransactionHistory>,
//     #[account(mut)]
//     pub seller: Signer<'info>,
//     pub system_program: Program<'info, System>
// }

#[account]
#[derive(InitSpace)]
pub struct VaultAccount{
  pub owner: Pubkey,
  pub balance: u64,
  pub bump: u8,
  pub min_balance: u64,
  pub transaction_history: Pubkey, // Reference to TransactionHistory account
}

#[account]
pub struct TransactionHistory {
    pub vault: Pubkey,                // Reference to the vault
    pub transactions: Vec<TransactionData>, // Array to hold transaction records
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct TransactionData {
    pub transaction_id: Pubkey,
    #[max_len(50)]
    pub transaction_type: String, // e.g., "deposit", "withdrawal", "refund"
    pub amount: u64,
    pub date: i64,
    #[max_len(300)]
    pub description: String,
}


  #[error_code]
pub enum CustomError {
    #[msg("Invalid amount.")]
    InvalidAmount,
    #[msg("Insufficient balance.")]
    InsufficientBalance,
    #[msg("Cannot withdraw below minimum balance.")]
    BelowMinimumBalance,
    #[msg("No refund request.")]
    NoRefundPending,
    #[msg("Wrong owner")]
    UnauthorizedAccess
}
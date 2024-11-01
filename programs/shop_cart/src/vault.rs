use anchor_lang::{ prelude::*, solana_program::{program, system_instruction}};
use crate::{CustomError, DepositSol, InitializeVault, PaySol, RefundSol, TransactionData, WithdrawSol};


pub fn initialize_vault(ctx: Context<InitializeVault>, bump: u8, min_balance: u64) -> Result<()>{
    let vault = &mut ctx.accounts.vault;
    
    vault.owner = ctx.accounts.seller.key();
    vault.balance = 0;
    vault.bump = bump;
    vault.min_balance = min_balance;
    vault.transaction_history = ctx.accounts.transaction_history.key();

    let transaction_history = &mut ctx.accounts.transaction_history;
    transaction_history.vault = vault.key();
    transaction_history.transactions.push(TransactionData {
        transaction_id: vault.key(), // Using vault key as unique ID for first transaction
        transaction_type: "Creation of vault account".to_string(),
        amount: min_balance,
        date: Clock::get()?.unix_timestamp,
        description: "Vault created".to_string(),
    });

    msg!("Vault and transaction history initialized for seller: {}", vault.owner);
    Ok(())
  }

pub fn deposit_sol(ctx: Context<DepositSol>, amount: u64) -> Result<()>{

    
    let txd = system_instruction::transfer(
        &mut ctx.accounts.seller.key(), 
        &mut ctx.accounts.vault.key(), 
        amount);
 
    program::invoke(&txd, &[
        ctx.accounts.seller.to_account_info(),
        ctx.accounts.vault.to_account_info(),
    ],)?;

    (&mut ctx.accounts.vault).balance += amount;

    let transaction_history = &mut ctx.accounts.transaction_history;

    // Log and push the transaction
    transaction_history.transactions.push(TransactionData {
        transaction_id: ctx.accounts.seller.key(),
        transaction_type: "Deposit".to_string(),
        amount,
        date: Clock::get()?.unix_timestamp,
        description: "Deposit to vault".to_string(),
    });

    Ok(())
}

pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let remaining_balance = vault.balance.checked_sub(amount).unwrap();

    require!(remaining_balance <= 1_000_000_000, CustomError::InsufficientBalance);

    vault.balance -= amount;

    // let txd = system_instruction::transfer(
    //     &mut ctx.accounts.vault.key(), 
    //     &mut ctx.accounts.seller.key(), 
    //     amount);
 
    // program::invoke(&txd, &[
    //     ctx.accounts.vault.to_account_info(),
    //     ctx.accounts.seller.to_account_info(),
    // ],)?;

    //Transfer SOL from the vault PDA to the seller's wallet
    **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += amount;

    let transaction_history = &mut ctx.accounts.transaction_history;
    transaction_history.transactions.push(TransactionData {
        transaction_id: ctx.accounts.seller.key(),
        transaction_type: "Withdraw".to_string(),
        amount,
        date: Clock::get()?.unix_timestamp,
        description: "Withdraw sol from vault to seller wallet".to_string(),
    });
    Ok(())
}

pub fn pay_sol(ctx: Context<PaySol>, amount: u64) -> Result<()>{

    let txd = system_instruction::transfer(
        &mut ctx.accounts.buyer.key(), 
        &mut ctx.accounts.vault.key(), 
        amount);
 
    program::invoke(&txd, &[
        ctx.accounts.buyer.to_account_info(),
        ctx.accounts.vault.to_account_info(),
    ],)?;

    (&mut ctx.accounts.vault).balance += amount;

    let transaction_history = &mut ctx.accounts.transaction_history;
    transaction_history.transactions.push(TransactionData {
        transaction_id: ctx.accounts.buyer.key(),
        transaction_type: "Pay".to_string(),
        amount,
        date: Clock::get()?.unix_timestamp,
        description: "Buyer pay sol to the vault".to_string(),
    });
    Ok(())
}


pub fn refund_sol(ctx: Context<RefundSol>, amount: u64) -> Result<()>{
    let vault = &mut ctx.accounts.vault;
    let remaining_balance = vault.balance.checked_sub(amount).unwrap();
    require!(remaining_balance <= (vault.balance + 1_000_000_000), CustomError::InsufficientBalance);
    **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? += amount;

    let transaction_history = &mut ctx.accounts.transaction_history;
    transaction_history.transactions.push(TransactionData {
        transaction_id: ctx.accounts.buyer.key(),
        transaction_type: "Refund".to_string(),
        amount,
        date: Clock::get()?.unix_timestamp,
        description: "Refund sol from vault to buyer wallet".to_string(),
    });
    Ok(())
}

// pub fn close_vault(ctx: Context<CloseVault>) -> Result<()>{
//      // Get a mutable reference to the vault account
//      let vault = &mut ctx.accounts.vault;

//      // Ensure the caller is the owner of the vault
//      require!(ctx.accounts.seller.key() == vault.owner, CustomError::UnauthorizedAccess);
 
//      // You can log the vault balance before closing if needed (for debugging)
//      let transfer_amount = vault.balance;
 
//      // Log the transaction history
//      let transaction_history = &mut ctx.accounts.transaction_history;
//      transaction_history.transactions.push(TransactionData {
//          transaction_id: ctx.accounts.seller.key(),
//          transaction_type: "Close account".to_string(),
//          amount: transfer_amount, // Adjust this if you want to track the amount being transferred
//          date: Clock::get()?.unix_timestamp,
//          description: "All SOL refunded to wallet and vault is closed".to_string(),
//      });
 
//      // Set the vault balance to zero (optional, but it's good practice)
//      vault.balance = 0;
 
//      // The account will automatically be closed and lamports transferred to `seller` 
//      // due to the `close = seller` attribute in the `CloseVault` struct.
 
//      Ok(())
//     // let vault = &mut ctx.accounts.vault;

//     // // Ensure the caller is the owner of the vault
//     // require!(ctx.accounts.seller.key() == vault.owner, CustomError::UnauthorizedAccess);

//     // Transfer remaining lamports back to the seller
//     // let transfer_amount = vault.balance;
//     // **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += vault.balance;
//     // **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= vault.balance; // Deduct from vault
//     //  // Add to seller
     

//     // let transaction_history = &mut ctx.accounts.transaction_history;
//     // transaction_history.transactions.push(TransactionData {
//     //     transaction_id: ctx.accounts.seller.key(),
//     //     transaction_type: "Close account".to_string(),
//     //     amount: 0,
//     //     date: Clock::get()?.unix_timestamp,
//     //     description: "All sol refund to wallet and vault is close".to_string(),
//     // });

//     // Set the vault balance to zero
//     // vault.balance = 0; // Optional, but good practice

//     // // Close the vault account
//     // // This will transfer the account to the system program and effectively delete it
//     // // Here we specify the destination account for closing
//     // let vault_info = ctx.accounts.vault.to_account_info();
//     // let destination = ctx.accounts.seller.to_account_info(); // The seller will receive the lamports

//     // **vault_info.try_borrow_mut_lamports()? -= transfer_amount; // First, deduct balance
//     // **destination.try_borrow_mut_lamports()? += transfer_amount; // Then, add to the seller

//     // // Now we close the vault account
//     // // Here we just remove the vault account from the state.
//     // anchor_lang::solana_program::program::close_account(vault_info, destination)?;
// }
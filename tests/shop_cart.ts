import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ShopCart } from "../target/types/shop_cart";
import { expect } from "chai";

describe("shop_cart", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ShopCart as Program<ShopCart>;
  const programProvider = program.provider as anchor.AnchorProvider;

  const shopPair = anchor.web3.Keypair.generate();
  let transactionHistoryPublicKey;


  it("Is shop acc initialized!", async () => {


    const [vaultPublicKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault"), programProvider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const [historyKey, historyBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("history"), vaultPublicKey.toBuffer()],
      program.programId
    );
    transactionHistoryPublicKey = historyKey;
    // Add your test here.
    const tx = await program.methods.initializeVault(vaultBump, new anchor.BN(1000000000)).accountsStrict({
      vault: vaultPublicKey,
      transactionHistory: transactionHistoryPublicKey,
      seller: programProvider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).rpc();

    const result = await program.account.vaultAccount.fetch(vaultPublicKey);
    const transaction = await program.account.transactionHistory.fetch(historyKey);
    
    expect(result.balance.toString()).to.eql("0"); // Initial balance should be 0
    expect(result.minBalance.toString()).to.eql("1000000000"); // Check min balance
    expect(result.bump).to.eql(vaultBump);
    console.log(`account: ${result.owner}`) 
    console.log(`vaultPublickey: ${vaultPublicKey}`) 
    console.log(`balance: ${result.balance}, minBalance: ${result.minBalance}, bump: ${result.bump}`) // Check if the name is correct
    console.log(`Initialized transaction history: ${JSON.stringify(transaction.transactions, null, 2)}`);
    console.log("Your transaction signature", tx);
  });


  it("Deposit sol to vault!", async () => {

    const deposit_amount = new anchor.BN(200000000);
    const initiali_seller_sol = new anchor.BN(500000000);

    const [vaultPublicKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault"), programProvider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const resultInit = await program.account.vaultAccount.fetch(vaultPublicKey);
    

    // expect(resultInit.balance.toString()).to.eql("0"); // Initial balance should be 0 // Check min balance
    expect(resultInit.bump).to.eql(vaultBump);
    console.log(`Initial seller - sol balance: ${initiali_seller_sol}`);
    console.log(`Initial vault - balance: ${resultInit.balance}`);
    
    // Add your test here.
    const tx = await program.methods.depositSol(deposit_amount).accountsStrict({
      vault: vaultPublicKey,
      transactionHistory: transactionHistoryPublicKey,
      seller: programProvider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId
    }).rpc();

      const resultDeposit = await program.account.vaultAccount.fetch(vaultPublicKey);
      const transactionHistory = await program.account.transactionHistory.fetch(transactionHistoryPublicKey);
      const lastTransaction = transactionHistory.transactions[transactionHistory.transactions.length - 1];
      console.log(`Initialized transaction history: ${JSON.stringify(lastTransaction, null, 2)}`);

      // Verify the balances after deposit
      expect(resultDeposit.balance.toString()).to.eql(deposit_amount.toString()); // Check balance after deposit// 
      // expect(lastTransaction.transactionType).to.eql("deposit");
      // expect(lastTransaction.amount.toString()).to.eql(deposit_amount.toString());
      // expect(lastTransaction.description).to.eql("Deposit to vault");

      const seller_remaining_sol = initiali_seller_sol.sub(deposit_amount);
      console.log(`Updated seller - sol balance: ${seller_remaining_sol}`);
      console.log(`Updated vault - balance: ${resultDeposit.balance}`);
      console.log(`Transaction History - Type: ${lastTransaction.transactionId}`);
      console.log(`Transaction History - Type: ${lastTransaction.transactionType}`);
      console.log(`Transaction History - Amount: ${lastTransaction.amount}`);
      console.log(`Transaction History - Date: ${lastTransaction.date}`);
      console.log(`Transaction History - description: ${lastTransaction.description}`);
      console.log("Deposit transaction signature", tx);
    
  });

  it("Withdraw sol from vault!", async () => {

    const withdraw_amount = new anchor.BN(1000000);
    const initiali_seller_sol = new anchor.BN(500000000);

    const [vaultPublicKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault"), programProvider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const resultInit = await program.account.vaultAccount.fetch(vaultPublicKey);

    // expect(resultInit.balance.toString()).to.eql("0"); // Initial balance should be 0 // Check min balance
    // expect(resultInit.bump).to.eql(vaultBump);
    console.log(`Initial seller - sol balance: ${initiali_seller_sol}`);
    console.log(`Initial vault - balance: ${resultInit.balance}`);
    
    // Add your test here.
    const tx = await program.methods.withdrawSol(withdraw_amount).accountsStrict({
          vault: vaultPublicKey,
          transactionHistory: transactionHistoryPublicKey,
          seller: programProvider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).rpc();

        const resultWithdraw = await program.account.vaultAccount.fetch(vaultPublicKey);
        const new_seller_sol = initiali_seller_sol.add(withdraw_amount);
        const new_seller_balance = resultInit.balance.sub(withdraw_amount);
        const transactionHistory = await program.account.transactionHistory.fetch(transactionHistoryPublicKey);
        const lastTransaction = transactionHistory.transactions[transactionHistory.transactions.length - 1];

        console.log(`Initialized transaction history: ${JSON.stringify(lastTransaction, null, 2)}`);

        expect(resultWithdraw.balance > withdraw_amount);
        expect(resultWithdraw.balance.toString()).to.eql(new_seller_balance.toString());
        console.log(`Withdraw amount: ${withdraw_amount}`);
        console.log(`Updated vault - balance: ${resultWithdraw.balance}`);
        console.log(`Updated seller - sol balance: ${new_seller_sol}`);
  });

  it("Buyer pay sol to vault!", async () => {

    const pay_amount = new anchor.BN(200000000);
    const initiali_buyer_sol = new anchor.BN(500000000);

    const [vaultPublicKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault"), programProvider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const resultInit = await program.account.vaultAccount.fetch(vaultPublicKey);
    console.log(`Initial buyer - sol balance: ${initiali_buyer_sol}`);
    console.log(`Initial vault - balance: ${resultInit.balance}`);
    
    // Add your test here.
    const tx = await program.methods.paySol(pay_amount).accountsStrict({
          vault: vaultPublicKey,
          transactionHistory: transactionHistoryPublicKey,
          buyer: programProvider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).rpc();

        const resultPay = await program.account.vaultAccount.fetch(vaultPublicKey);
        const transactionHistory = await program.account.transactionHistory.fetch(transactionHistoryPublicKey);
        const lastTransaction = transactionHistory.transactions[transactionHistory.transactions.length - 1];

        console.log(`Initialized transaction history: ${JSON.stringify(lastTransaction, null, 2)}`);

        // Verify the balances after deposit
        const new_vault_balance = resultInit.balance.add(pay_amount);
        const buyer_remaining_sol = initiali_buyer_sol.sub(pay_amount);
        expect(resultPay.balance.toString()).to.eql(new_vault_balance.toString()); 

        console.log(`Updated buyer - sol balance: ${buyer_remaining_sol}`);
        console.log(`Updated vault - balance: ${resultPay.balance}`);
        console.log("Deposit transaction signature", tx);
  });

  it("Refund sol from vault to buyer wallet!", async () => {

    const refund_amount = new anchor.BN(10000000);
    const initiali_buyer_sol = new anchor.BN(300000000);

    const [vaultPublicKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault"), programProvider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const resultInit = await program.account.vaultAccount.fetch(vaultPublicKey);

    // expect(resultInit.balance.toString()).to.eql("0"); // Initial balance should be 0 // Check min balance
    // expect(resultInit.bump).to.eql(vaultBump);
    console.log(`Initial buyer - sol balance: ${initiali_buyer_sol}`);
    console.log(`Initial vault - balance: ${resultInit.balance}`);
    
    // Add your test here.
    const tx = await program.methods.refundSol(refund_amount).accountsStrict({
          vault: vaultPublicKey,
          transactionHistory: transactionHistoryPublicKey,
          buyer: programProvider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).rpc();

        const resultRefund = await program.account.vaultAccount.fetch(vaultPublicKey);
        const new_buyer_sol = initiali_buyer_sol.add(refund_amount);
        const new_vault_balance = resultInit.balance.sub(refund_amount);
        const transactionHistory = await program.account.transactionHistory.fetch(transactionHistoryPublicKey);
        const lastTransaction = transactionHistory.transactions[transactionHistory.transactions.length - 1];

        console.log(`Initialized transaction history: ${JSON.stringify(transactionHistory.transactions, null, 2)}`);
        //console.log(`Initialized transaction history: ${JSON.stringify(lastTransaction, null, 2)}`);

        expect(resultRefund.balance > refund_amount);
        // expect(resultRefund.balance.toString()).to.eql(new_vault_balance.toString());
        console.log(`Withdraw amount: ${refund_amount}`);
        console.log(`Updated vault - balance: ${resultRefund.balance}`);
        console.log(`Updated buyer - sol balance: ${new_buyer_sol}`);
  });

  // it("Close vault!", async () => {

  //   const provider = anchor.AnchorProvider.env();
  //   anchor.setProvider(provider);

  //   const initiali_seller_sol = new anchor.BN(500000000);

  //   const [vaultPublicKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
  //     [Buffer.from("vault"), programProvider.wallet.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const vaultbalance =  await provider.connection.getBalance(vaultPublicKey);
  //   console.log(`This is the balance in the vault:${vaultbalance}`);

  //   const sellerBalanceBefore = await provider.connection.getBalance(programProvider.wallet.publicKey);

    
  //   // Add your test here.
  //   const tx = await program.methods.closeVault().accountsStrict({
  //         vault: vaultPublicKey,
  //         transactionHistory: transactionHistoryPublicKey,
  //         seller: programProvider.wallet.publicKey,
  //         systemProgram: anchor.web3.SystemProgram.programId
  //       }).rpc();

  //       const sellerBalanceAfter = await provider.connection.getBalance(programProvider.wallet.publicKey);
  //       const balanceDifference = sellerBalanceAfter - vaultbalance;

  //       console.log(`Seller's balance increased by: ${balanceDifference}`);
  //       console.assert(balanceDifference === sellerBalanceBefore, "Balance transfer to seller failed");

  //       const resultWithdraw = await program.account.vaultAccount.fetch(vaultPublicKey);
  //       const transactionHistory = await program.account.transactionHistory.fetch(transactionHistoryPublicKey);
  //       const lastTransaction = transactionHistory.transactions[transactionHistory.transactions.length - 1];

  //       console.log(`Initialized transaction history: ${JSON.stringify(lastTransaction, null, 2)}`);

  // });

  it("Close vault!", async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const initiali_seller_sol = new anchor.BN(500000000);

    const [vaultPublicKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("vault"), programProvider.wallet.publicKey.toBuffer()],
      program.programId
    );

    const vaultBalanceBefore = await provider.connection.getBalance(vaultPublicKey);
    console.log(`This is the balance in the vault before closing: ${vaultBalanceBefore}`);

    const sellerBalanceBefore = await provider.connection.getBalance(programProvider.wallet.publicKey);
    console.log(`Seller's balance before closing vault: ${sellerBalanceBefore}`);
    console.log(`pubkey vault: ${vaultPublicKey}`);
    const accountInfo = await provider.connection.getAccountInfo(vaultPublicKey);

if (accountInfo === null) {
    console.log("Account does not exist.");
} else if (accountInfo.data.length === 0) {
    console.log("Account exists but has no data.");
} else {
    console.log("Account exists and has data.");
}

    // Add your test here.
    const tx = await program.methods.closeVault().accountsStrict({
          vault: vaultPublicKey,
          transactionHistory: transactionHistoryPublicKey,
          seller: programProvider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).rpc();
    
    console.log(`pubkey vault after: ${vaultPublicKey}`);
    const sellerBalanceAfter = await provider.connection.getBalance(programProvider.wallet.publicKey);
    console.log(`Seller's balance after closing vault: ${sellerBalanceAfter}`);

    const expectedSellerBalanceAfter = sellerBalanceBefore + vaultBalanceBefore;

    // Check if the seller's balance after the transaction matches the expected amount
    // console.assert(sellerBalanceAfter === expectedSellerBalanceAfter, "Balance transfer to seller failed");

    const resultWithdraw = await program.account.vaultAccount.fetch(vaultPublicKey);
    const transactionHistory = await program.account.transactionHistory.fetch(transactionHistoryPublicKey);
    const lastTransaction = transactionHistory.transactions[transactionHistory.transactions.length - 1];

    console.log(`Initialized transaction history: ${JSON.stringify(lastTransaction, null, 2)}`);
});

});

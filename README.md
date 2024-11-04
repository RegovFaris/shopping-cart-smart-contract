## Shopping Cart Smart Contract
This smart contract manages the shopping cart process, focusing on vault operations and tracking transaction history throughout the shopping experience.
The details of the smart contract can be found on the file directory as mention:

- `programs/shop_cart/src/lib.rs`
- `programs/shop_cart/src/vault.rs`

The contract includes five primary functions for managing the vault:

- initializeVault
- depositSol
- withdrawSol
- paySol
- refundSol

In addition, the contract automatically creates a transaction history record whenever initializeVault is triggered.

A Program Derived Address (PDA) is used to securely initialize both the vault and the transaction history.

All other transaction that happen between buyer with vault and seller with vault will be recoreded. 

On top of that, to test the function, the test script can be found at this directory `tests/shop_cart.ts`

Noted that this program is to show the function in smart contract that will be used in the shopping cart app. The details of shopping cart code will be share in another repo.
When successfully build the program, 2 files that generated during the process of deploying the program will be copy into the shopping cart app project.
The two file can be found on this directory:
- `target/idl/shop_cart.json`
- `target/types/shop_cart.ts`

## Update on progress
- working on the smart contract for the nft.
- when done will working towards the auditor smart contract

## Getting Started

### Prerequisites

1. install rust
``` bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
2. Then run the command below to ensure rust being instal properly on your local device:
``` bash
solana --version
```

3. install solana CLI
``` bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.18/install)"
```
4. run the command below to ensure solana cli being install properly
``` bash
solana --version
```

6. Install avm
``` bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```
7. Install anchir CLI
``` bash
avm install latest
```
8. Verify the installation.
``` bash
anchor --version
```

### Set up new wallet (for those that don't have solana wallet yet)

1. Run the following command to generate a new wallet:\
``` bash
solana-keygen new --outfile ~/my-solana-wallet.json
```
2. Set the Wallet as the Default for Solana CLI:
``` bash
solana config set --keypair ~/my-solana-wallet.json
```
3. Fund Your Wallet on Devnet:
``` bash
solana airdrop 5
```
4. Chekc the balance:
``` bash
solana balance
```

### Installation (localhost)

1. Clone this repository:
``` bash
git clone https://github.com/your-username/shopping-cart-smart-contract.git
cd shopping-cart-smart-contract
```
2. Set your solana in local mode (to test on local first)
``` bash
solana config set --url l
```
3. Start the test validator (on new terminal)
``` bash
solana-test-validator
```
4. Build the program
``` bash
anchor build
```
5. Deploy the program
``` bash
anchor deploy
```
6. Test the program
``` bash
anchor test
```

### Installation (devnet)

1. Set your solana in dev mode
``` bash
solana config set --url d
```
2. Start the test validator (on new terminal)
``` bash
solana-test-validator
```
3. Inside the file directory `Anchor.toml`, change the setting as below:
``` bash
[toolchain]

[features]
resolution = true
skip-lint = false

[programs.localnet]
shop_cart = "Ghjt9quQKYs9yHANEUaVHPaBFfmhTECeERSKU9q9SjKa"

[programs.devnet]
shop_cart = "Ghjt9quQKYs9yHANEUaVHPaBFfmhTECeERSKU9q9SjKa"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
#cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"

```

make sure commented the `#cluster = "localnet"` and uncommented the `cluster = "devnet"` before proceed to the next step

4. Build the program
``` bash
anchor build
```
5. Deploy the program
``` bash
anchor deploy
```

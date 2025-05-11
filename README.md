
# Z-Fubao: Solana DeFi Protocol

Z-Fubao is a decentralized finance (DeFi) protocol built on Solana that enables users to:
1. Deposit ZBTC as collateral to mint ZUSD stablecoins
2. Stake ZUSD tokens to receive SZUSD which is yield-bearing stablecoin

## Protocol Overview

### Vault Program
The vault program allows users to:
- Deposit ZBTC as collateral and mint ZUSD stablecoins at a 70% loan-to-value ratio
- Repay ZUSD to unlock and withdraw their ZBTC collateral
- Maintain over-collateralization to prevent liquidation

### Staking Program
The staking program enables users to:
- Stake ZUSD tokens and receive SZUSD tokens 1:1
- Unstake by burning SZUSD tokens to receive back their ZUSD

### Client Application
A web-based interface for interacting with the protocol, built with:
- TypeScript
- Vite
- Modern frontend frameworks

## Getting Started

### Prerequisites
- Solana CLI tools
- Node.js 16+
- pnpm package manager

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/z-fubao.git
cd z-fubao

# Build Solana programs
cd program/vault
cargo build-bpf

cd ../stake
cargo build-bpf

# Set up the client application
cd ../../client
pnpm install
pnpm dev
```

## Usage

### Minting ZUSD
1. Connect your wallet through the client interface
2. Navigate to the Vault section
3. Deposit ZBTC as collateral
4. Mint ZUSD tokens (up to 70% of your collateral value)

### Staking ZUSD
1. Navigate to the Staking section
2. Approve ZUSD for staking
3. Stake your ZUSD to receive SZUSD tokens
4. Unstake anytime by burning SZUSD tokens

## Architecture

### Smart Contracts
- `program/vault/src/lib.rs`: Handles collateral deposits, ZUSD minting, repayments
- `program/stake/src/main.rs`: Manages ZUSD staking and SZUSD token distribution

### Client
The client application provides a user-friendly interface to interact with the Solana programs, handling:
- Wallet connections
- Transaction building and signing
- Real-time updates of user positions
- Responsive UI for both desktop and mobile devices

## Development

### Program Deployment
```bash
solana program deploy --program-id <PROGRAM_ID> target/deploy/vault.so
solana program deploy --program-id <PROGRAM_ID> target/deploy/stake.so
```

### Client Development
```bash
cd client
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build
```

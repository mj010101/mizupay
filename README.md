# Mizupay: Sui BTC PayFi Protocol

Mizupay is a DeFi protocol built on Sui that enables users to:

1. Deposit LBTC as collateral to mint LUSD stablecoins
2. Stake LUSD tokens to receive sLUSD which is yield-bearing stablecoin
3. Use the yield to claim USDC upfront and use in payment

## Protocol Overview

### Vault Program

The vault program allows users to:

- Deposit LBTC as collateral and mint LUSD stablecoins at a 70% loan-to-value ratio
- Repay LUSD to unlock and withdraw their LBTC collateral
- Maintain over-collateralization to prevent liquidation

### Staking Program

The staking program enables users to:

- Stake LUSD tokens and receive sLUSD tokens 1:1
- Unstake by burning sLUSD tokens to receive back their LUSD

### Client Application

A web-based interface for interacting with the protocol, built with:

- TypeScript
- Vite
- React
- Sui Wallet Kit

## Getting Started

### Prerequisites

- Sui CLI tools
- Node.js 16+
- pnpm package manager

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/Mizupay.git
cd Mizupay

# Build Sui modules (once the Sui contracts are ready)
# cd program/modules
# sui move build

# Set up the client application
cd client
pnpm install
pnpm dev
```

## Usage

### Minting LUSD

1. Connect your wallet through the client interface
2. Navigate to the Mint section
3. Deposit LBTC as collateral
4. Mint LUSD tokens (up to 70% of your collateral value)

### Staking LUSD

1. Navigate to the Earn section
2. Approve LUSD for staking
3. Stake your LUSD to receive sLUSD tokens
4. Unstake anytime by burning sLUSD tokens

## Architecture

### Smart Contracts

- Sui Move modules for vault and staking functionality

### Client

The client application provides a user-friendly interface to interact with the Sui modules, handling:

- Wallet connections via Sui Wallet Kit
- Transaction building and signing
- Real-time updates of user positions
- Responsive UI for both desktop and mobile devices

## Development

### Client Development

```bash
cd client
pnpm dev       # Start development server on port 8080
pnpm build     # Build for production
pnpm preview   # Preview production build
```

### Features

- **Dashboard**: View your assets, accumulated yield, and staked LUSD management
- **Deposit**: Convert BTC to LBTC
- **Mint**: Lock LBTC and mint LUSD
- **Earn**: Stake LUSD to earn yield with sLUSD

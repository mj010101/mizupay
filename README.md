# Mizupay: Sui BTC PayFi Protocol

Mizupay is a DeFi protocol built on Sui that enables users to:

1. Deposit LBTC as collateral to mint mzUSD stablecoins
2. Stake mzUSD tokens to receive smzUSD which is yield-bearing stablecoin
3. Use the yield to claim USDC upfront and use in payment

## Protocol Overview

### Vault Program

The vault program allows users to:

- Deposit LBTC as collateral and mint mzUSD stablecoins at a 70% loan-to-value ratio
- Repay mzUSD to unlock and withdraw their LBTC collateral
- Maintain over-collateralization to prevent liquidation

### Staking Program

The staking program enables users to:

- Stake mzUSD tokens and receive smzUSD tokens 1:1
- Unstake by burning smzUSD tokens to receive back their mzUSD

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

### Minting mzUSD

1. Connect your wallet through the client interface
2. Navigate to the Mint section
3. Deposit LBTC as collateral
4. Mint mzUSD tokens (up to 70% of your collateral value)

### Staking mzUSD

1. Navigate to the Earn section
2. Approve mzUSD for staking
3. Stake your mzUSD to receive smzUSD tokens
4. Unstake anytime by burning smzUSD tokens

## Architecture

### Smart Contracts

- Sui Move modules for vault and staking functionality

### Price Oracle (Pyth)

Mizupay integrates **[Pyth Network](https://pyth.network)** to fetch the on-chain BTC/USD price that secures the protocol's LTV calculations.

* On every `deposit & borrow` action the client app
  1. Queries the Hermes service for the latest BTC/USD price-feed update.
  2. Injects that update into the same transaction via `SuiPythClient.updatePriceFeeds`, obtaining a fresh `PriceInfoObject` id.
  3. Passes the returned `PriceInfoObject` to the `lending::borrow` Move entry-function, ensuring all collateral checks rely on the most up-to-date oracle data.

* The Move module `lending.move` uses the supplied `PriceInfoObject` (and a time-stamp-verified `Clock`) to
  - calculate `max_borrowable` and `max_withdrawable`,
  - validate collateral ratios,
  - and remain oracle-agnostic (any asset supported by Pyth can be added in the future).

This design removes any need for off-chain price pushers—the oracle update and user operation are executed atomically in a single transaction.

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

- **Dashboard**: View your assets, accumulated yield, and staked mzUSD management
- **Deposit**: Convert BTC to LBTC
- **Mint**: Lock LBTC and mint mzUSD
- **Earn**: Stake mzUSD to earn yield with smzUSD

---

![image](https://github.com/user-attachments/assets/8717ed2e-d44f-4863-bbd2-e7bf167367b4)


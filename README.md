# Solana Coin Flip Game

A decentralized coin flip game built on the Solana blockchain using Next.js. Players can bet SOL tokens and have a 50/50 chance to double their bet (minus platform fees).

## Features

- 🪙 **Coin Flip Game**: Classic heads or tails with blockchain integration
- 💰 **Multiple Bet Amounts**: Choose from 0.1, 0.25, 0.5, 0.75, or 1 SOL
- 🎯 **Fair Gameplay**: Random number generation for unbiased results
- 💸 **Platform Fees**: 0.3% fee on all transactions
- 🔗 **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- 📱 **Responsive Design**: Beautiful, minimal UI that works on all devices

## How to Play

1. **Connect Wallet**: Click the "Connect Wallet" button and select your Solana wallet
2. **Choose Side**: Select either "Heads" or "Tails"
3. **Set Bet Amount**: Choose how much SOL you want to bet (0.1 to 1 SOL)
4. **Flip Coin**: Click "Flip Coin!" to start the game
5. **Get Results**: If you win, you'll receive double your bet (minus 0.3% platform fee)

## Game Rules

- **Win**: If your choice matches the result, you win double your bet amount
- **Lose**: If your choice doesn't match, you lose your entire bet
- **Platform Fee**: 0.3% fee is deducted from all transactions
- **Minimum Balance**: You must have sufficient SOL balance to place a bet

## Technical Details

### Built With
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern styling
- **Solana Web3.js**: Blockchain integration
- **Solana Wallet Adapter**: Wallet connectivity

### Blockchain Features
- **Devnet Support**: Currently configured for Solana devnet
- **Transaction Handling**: Secure SOL transfers
- **Balance Management**: Real-time wallet balance updates
- **Error Handling**: Graceful transaction failure handling

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Solana wallet (Phantom, Solflare, etc.)
- SOL tokens (use Solana devnet faucet for testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coinflip
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Run the development server:
```bash
bun dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting Test SOL

For testing on devnet:
1. Visit [Solana Faucet](https://faucet.solana.com/)
2. Enter your wallet address
3. Request devnet SOL

## Project Structure

```
coinflip/
├── app/
│   ├── components/
│   │   ├── WalletProvider.tsx    # Solana wallet integration
│   │   └── CoinFlipGame.tsx      # Main game component
│   ├── utils/
│   │   └── solana.ts             # Blockchain utilities
│   ├── layout.tsx                # App layout with wallet providers
│   └── page.tsx                  # Main page
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## Configuration

### Network Settings
The app is currently configured for Solana devnet. To switch to mainnet:

1. Update `WalletAdapterNetwork.Devnet` to `WalletAdapterNetwork.MainnetBeta` in `WalletProvider.tsx`
2. Ensure you have real SOL tokens in your wallet

### Platform Wallet
In production, replace the placeholder platform wallet address with your actual platform wallet:

```typescript
// In utils/solana.ts
export const PLATFORM_WALLET = new PublicKey('YOUR_PLATFORM_WALLET_ADDRESS');
```

## Security Considerations

- **Random Number Generation**: Current implementation uses client-side randomness. For production, consider using Chainlink VRF or similar verifiable random functions
- **Platform Wallet Security**: Ensure your platform wallet is properly secured
- **Transaction Validation**: Always validate transactions on the blockchain
- **Error Handling**: Implement proper error handling for failed transactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue on GitHub.

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, testing, and compliance with local regulations.

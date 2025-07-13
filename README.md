# Solana Coin Flip (Demo)

🎲 A **client-side demo** of a decentralized coin flip game on Solana. Users connect their wallet (Phantom/Solflare), place a bet, and simulate flipping a coin to win or lose SOL on the Devnet.

## 🚀 Features
- Connect Solana wallet (Phantom & Solflare supported)
- Fetch and display user SOL balance (Devnet)
- Place a simulated bet with selectable amounts (0.1–1 SOL)
- Flip a coin with client-side animation & random result
- Display win/loss results with payout calculation
- React-based UI with TailwindCSS styling

## 📦 Stack
- React.js (Frontend)
- Solana Wallet Adapter (Phantom, Solflare)
- Solana Web3.js (for Devnet connection and balance fetch)
- TailwindCSS
- Axios (for simulated API calls)

## 🔥 Future Plans
- Implement actual on-chain smart contract for coin flips
- Real SOL transactions using Solana Web3.js
- Secure randomness with Switchboard/Chainlink VRF
- Support SPL tokens alongside SOL

## 💻 Running Locally
```bash
git clone https://github.com/your-username/solana-coinflip-demo.git
cd solana-coinflip-demo
npm install
npm run dev

## Demo Video
https://bimalxflip.vercel.app/
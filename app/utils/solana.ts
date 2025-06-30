import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Keypair
} from '@solana/web3.js';
import bs58 from "bs58"

// Platform wallet address where all lost money and fees go
export const PLATFORM_WALLET = new PublicKey('FrkC18jMLDDehiAYEcKV1mGjMwtoZHc8VayEssmLQFe3');

// Get platform wallet keypair from environment variable
export const getPlatformWalletKeypair = (): Keypair => {
    const privateKeyString = process.env.PRIVATE_KEY_PLATFORM_WALLET;
  
    // 1. Basic validation: Check if the environment variable is set
    if (!privateKeyString) {
      throw new Error('PRIVATE_KEY_PLATFORM_WALLET environment variable is not set');
    }
  
    let privateKeyArray: Uint8Array;
    try {
      // 2. Attempt to decode the private key string as Base58
      privateKeyArray = bs58.decode(privateKeyString);
    } catch (error) {
      // If decoding as Base58 fails, it means the string is not a valid Base58 private key.
      // In this scenario, you'd want to throw an error indicating the format issue.
      // We are no longer trying to parse it as comma-separated numbers, as you confirmed it's not.
      console.error("Error decoding private key as Base58:", error);
      throw new Error('PRIVATE_KEY_PLATFORM_WALLET is not a valid Base58 string. Please check its format.');
    }
    
    // 3. Create a Keypair from the decoded Uint8Array
    return Keypair.fromSecretKey(privateKeyArray);
  };

export class CoinFlipGame {
  private connection: Connection;
  private platformWalletKeypair: Keypair;

  constructor(connection: Connection) {
    this.connection = connection;
    this.platformWalletKeypair = getPlatformWalletKeypair();
  }

  async createGameTransaction(
    userWallet: PublicKey,
    betAmount: number,
    userChoice: 'heads' | 'tails'
  ): Promise<Transaction> {
    const transaction = new Transaction();
    
    // Transfer the full bet amount from user to platform wallet
    // This includes both the bet amount and the platform fee
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userWallet,
        toPubkey: PLATFORM_WALLET,
        lamports: betAmount * LAMPORTS_PER_SOL,
      })
    );

    return transaction;
  }

  async processGameResult(
    userWallet: PublicKey,
    betAmount: number,
    userChoice: 'heads' | 'tails',
    result: 'heads' | 'tails'
  ): Promise<Transaction> {
    const transaction = new Transaction();
    const won = userChoice === result;
    
    if (won) {
      // Calculate payout (double the bet minus platform fee)
      const platformFee = betAmount * 0.003;
      const netBetAmount = betAmount - platformFee;
      const payout = netBetAmount * 2;
      
      // Transfer payout from platform to user
      // Now the platform wallet can actually sign this transaction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.platformWalletKeypair.publicKey,
          toPubkey: userWallet,
          lamports: payout * LAMPORTS_PER_SOL,
        })
      );
    }
    // If lost, the entire bet amount (including platform fee) stays with the platform wallet
    // No additional transaction needed as the money was already transferred in createGameTransaction

    return transaction;
  }

  async sendPayoutTransaction(
    userWallet: PublicKey,
    payoutAmount: number
  ): Promise<string> {
    const transaction = new Transaction();
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: this.platformWalletKeypair.publicKey,
        toPubkey: userWallet,
        lamports: payoutAmount * LAMPORTS_PER_SOL,
      })
    );

    // Sign and send the transaction
    const signature = await this.connection.sendTransaction(
      transaction,
      [this.platformWalletKeypair]
    );
    
    return signature;
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async getPlatformBalance(): Promise<number> {
    return this.getBalance(this.platformWalletKeypair.publicKey);
  }

  generateRandomResult(): 'heads' | 'tails' {
    // as this is a test application so random logic
    return Math.random() < 0.5 ? 'heads' : 'tails';
  }

  // Helper method to calculate what the user actually receives when they win
  calculateUserPayout(betAmount: number): number {
    const platformFee = betAmount * 0.003;
    const netBetAmount = betAmount - platformFee;
    return netBetAmount * 2;
  }

  // Helper method to calculate platform earnings
  calculatePlatformEarnings(betAmount: number, won: boolean): number {
    if (won) {
      // If user wins, platform keeps the 0.3% fee
      return betAmount * 0.003;
    } else {
      // If user loses, platform keeps the entire bet amount
      return betAmount;
    }
  }

  // Get platform wallet public key
  getPlatformWalletPublicKey(): PublicKey {
    return this.platformWalletKeypair.publicKey;
  }
}

export const createCoinFlipGame = (connection: Connection): CoinFlipGame => {
  return new CoinFlipGame(connection);
}; 
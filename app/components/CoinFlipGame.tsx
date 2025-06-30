'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import axios from 'axios';

type Choice = 'heads' | 'tails';
type BetAmount = 0.1 | 0.25 | 0.5 | 0.75 | 1;

interface GameResult {
  userChoice: Choice;
  result: Choice;
  won: boolean;
  betAmount: number;
  payout: number;
}

export function CoinFlipGame() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetAmount>(0.1);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const betAmounts: BetAmount[] = [0.1, 0.25, 0.5, 0.75, 1];

  useEffect(() => {
    if (publicKey) fetchBalance();
  }, [publicKey, connection]);

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("Balance error:", err);
    }
  };
  const handleFlip = async () => {
    if (!publicKey || !selectedChoice) return;
  
    setIsLoading(true);
    setIsFlipping(true);
  
    try {
      // STEP 1: Send Bet Transaction (user signs)
      const initRes = await axios.post('/api/coinflip/initiate', {
        userPublicKey: publicKey.toBase58(),
        betAmount: selectedBet,
      });
  
      const initTx = Transaction.from(
        Buffer.from(initRes.data.transactionBase64, 'base64')
      );
  
      const signature = await sendTransaction(initTx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
  
      // STEP 2: Get Flip Result and (if win) payout transaction
      const resultRes = await axios.post('/api/coinflip/result', {
        userPublicKey: publicKey.toBase58(),
        selectedChoice,
        betAmount: selectedBet,
      });
  
      const { result, won, payout, transactionBase64 } = resultRes.data;
  
      if (won) {
        if (!transactionBase64) {
          throw new Error("No payout transaction received.");
        }
        console.log(payout)
        const payoutTx = Transaction.from(
          Buffer.from(transactionBase64, 'base64')
        );
  
        // ✅ Use raw transaction sender (not via wallet)
        const sig2 = await connection.sendRawTransaction(payoutTx.serialize());
        await connection.confirmTransaction(sig2, 'confirmed');
      }
  
      // STEP 3: Update result
      setGameResult({
        userChoice: selectedChoice,
        result,
        won,
        betAmount: selectedBet,
        payout,
      });
  
      await fetchBalance();
    } catch (error: any) {
      console.error('Flip error:', error);
      alert(error?.response?.data?.error || 'Flip failed. Try again.');
    } finally {
      setIsLoading(false);
      setIsFlipping(false);
    }
  };
  

  const resetGame = () => {
    setSelectedChoice(null);
    setGameResult(null);
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Solana Coin Flip</h1>
          <p className="text-gray-300 mb-8">Connect your wallet to start playing</p>
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Coin Flip</h1>
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg" />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6">
          <p className="text-gray-300 text-sm">Balance</p>
          <p className="text-2xl font-bold text-white">{balance.toFixed(4)} SOL</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          {!gameResult ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Choose Heads or Tails</h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedChoice('heads')}
                    className={`flex-1 py-4 px-6 rounded-lg font-bold transition-all ${
                      selectedChoice === 'heads'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    🪙 Heads
                  </button>
                  <button
                    onClick={() => setSelectedChoice('tails')}
                    className={`flex-1 py-4 px-6 rounded-lg font-bold transition-all ${
                      selectedChoice === 'tails'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    🪙 Tails
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Select Bet Amount</h2>
                <div className="grid grid-cols-3 gap-3">
                  {betAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedBet(amount)}
                      className={`py-3 px-4 rounded-lg font-bold transition-all ${
                        selectedBet === amount
                          ? 'bg-green-500 text-black'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {amount} SOL
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFlip}
                disabled={!selectedChoice || isLoading || balance < selectedBet}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  !selectedChoice || isLoading || balance < selectedBet
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                } text-white`}
              >
                {isLoading ? 'Processing...' : 'Flip Coin!'}
              </button>

              {balance < selectedBet && (
                <p className="text-red-400 text-sm text-center mt-2">
                  Insufficient balance
                </p>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className={`text-6xl mb-4 ${isFlipping ? 'animate-bounce' : ''}`}>
                {gameResult.result === 'heads' ? '🪙' : '🪙'}
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {gameResult.won ? '🎉 You Won! 🎉' : '😔 You Lost'}
              </h2>

              <p className="text-gray-300 mb-4">
                You chose: <span className="font-semibold text-white">{gameResult.userChoice}</span><br />
                Result: <span className="font-semibold text-white">{gameResult.result}</span>
              </p>

              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm">Bet Amount</p>
                <p className="text-xl font-bold text-white">{gameResult.betAmount} SOL</p>
                {gameResult.won && (
                  <>
                    <p className="text-gray-300 text-sm mt-2">Payout</p>
                    <p className="text-xl font-bold text-green-400">+{gameResult.payout.toFixed(4)} SOL</p>
                  </>
                )}
              </div>

              <button
                onClick={resetGame}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold text-white"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">Platform fee: 0.3% on all bets</p>
        </div>
      </div>
    </div>
  );
}

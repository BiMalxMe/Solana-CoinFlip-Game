// POST /api/coinflip/result.ts
import { NextResponse } from 'next/server';
import { Keypair, PublicKey, SystemProgram, Transaction, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getPlatformWalletKeypair } from '@/app/utils/solana';

const connection = new Connection('https://api.devnet.solana.com');

export async function POST(req: Request) {
  try {
    const keypair = getPlatformWalletKeypair()
    const body = await req.json();
    const { userPublicKey, selectedChoice, betAmount } = body;

    if (!userPublicKey || !selectedChoice || !betAmount) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Coin flip logic
    const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = result === selectedChoice;

    const platformFee = betAmount * 0.003;
    const netBet = betAmount - platformFee;
    const payout = won ? netBet * 2 : 0;

    if (!won) {
      return NextResponse.json({
        result,
        won,
        payout: 0,
      });
    }

    // Payout tx
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(userPublicKey),
        lamports: payout * LAMPORTS_PER_SOL,
      })
    );

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = keypair.publicKey;
    tx.sign(keypair);

    const base64Tx = tx.serialize().toString('base64');

    return NextResponse.json({
      result,
      won,
      payout,
      transactionBase64: base64Tx,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

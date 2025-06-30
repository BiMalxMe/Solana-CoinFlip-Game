// POST /api/coinflip/initiate.ts
import { NextResponse } from 'next/server';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Connection } from '@solana/web3.js';
import { getPlatformWalletKeypair } from '@/app/utils/solana';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userPublicKey, betAmount } = body;

    if (!userPublicKey || !betAmount) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const userPubkey = new PublicKey(userPublicKey);
    const platformPubkey = getPlatformWalletKeypair().publicKey;

    // Calculate total: bet + 0.3% fee
    const totalAmount = betAmount * 1.003;
    const lamports = Math.floor(totalAmount * LAMPORTS_PER_SOL); // floor to avoid fractions

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: platformPubkey,
        lamports,
      })
    );

    const connection = new Connection('https://api.devnet.solana.com');
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey;

    const base64Tx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toString('base64');

    return NextResponse.json({
      transactionBase64: base64Tx,
    });

  } catch (err) {
    console.error('Initiate Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

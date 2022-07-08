import { depositCollateralTx, withdrawCollateralTx } from '../../ratio-lending';
import {
  PublicKey,
  Transaction,
  Connection,
  // SignatureResult
} from '@solana/web3.js';
import {
  //sendSignedTransaction,
  sendTransaction,
  //signAllTransaction
} from '../../rf-web3';

export const SABER_IOU_MINT_DECIMALS = 6;

export async function deposit(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey,
  amount: number
): Promise<string> {
  console.log('Deposit to Swim', amount);

  const transaction = new Transaction();

  const tx1: any = await depositCollateralTx(connection, wallet, amount, mintCollKey);
  transaction.add(tx1);
  const txHash = await sendTransaction(connection, wallet, transaction);

  console.log('Swim deposit tx', txHash);
  return txHash.toString();
}

export async function withdraw(connection: Connection, wallet: any, mintCollKey: PublicKey, amount: number) {
  console.log('Withdraw from Saber', amount);

  const tx = new Transaction();
  const ix = await withdrawCollateralTx(connection, wallet, amount, mintCollKey);
  if (ix) {
    tx.add(ix);
  }
  const txHash = await sendTransaction(connection, wallet, tx);

  return txHash;
}

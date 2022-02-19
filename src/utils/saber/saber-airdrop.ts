import * as anchor from '@project-serum/anchor';

import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  Connection,
} from '@solana/web3.js';
import { Token, AccountLayout, MintLayout, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { use as chaiUse, assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  ISeedPoolAccountsFn,
  Fees,
  DEFAULT_FEE,
  SWAP_PROGRAM_ID,
  createInitializeNewSwapTx,
} from '@saberhq/stableswap-sdk';
import { SignerWallet, SolanaProvider, TransactionEnvelope } from '@saberhq/solana-contrib';
import {
  createInitMintInstructions,
  SPLToken,
  TOKEN_PROGRAM_ID,
  Percent,
  u64,
  TokenAmount,
  getOrCreateATA,
  getOrCreateATAs,
  Token as SToken,
  createMint,
  createMintToInstruction,
  getTokenAccount,
  ZERO,
  sleep,
} from '@saberhq/token-utils';

import { findMinerAddress, QuarrySDK, QUARRY_ADDRESSES } from '@quarryprotocol/quarry-sdk';
import { isMainThread } from 'worker_threads';
import { BN } from '@project-serum/anchor';
import { getProgramInstance } from '../ratio-lending';
import { sendTransaction } from '../web3';
import { SABER_REWARDER } from './constants';
import { TransactionInstructions } from '@saberhq/stableswap-sdk/dist/cjs/util/instructions';

chaiUse(chaiAsPromised);

const INITIAL_TOKEN_A_AMOUNT = LAMPORTS_PER_SOL;
const INITIAL_TOKEN_B_AMOUNT = LAMPORTS_PER_SOL;
const AMP_FACTOR = 100;
const INITIAL_BASE_AMOUNT = 5000000000000000;

const DEFAULT_DECIMALS = 6;

const FEES: Fees = {
  adminTrade: DEFAULT_FEE,
  adminWithdraw: DEFAULT_FEE,
  trade: new Percent(1, 4),
  withdraw: DEFAULT_FEE,
};

async function createMintAndAccount(connection: Connection, wallet: any, amount: u64 | number) {
  const program = getProgramInstance(connection, wallet);
  const provider = program.provider;

  const mint = Keypair.generate();
  const mintKey = mint.publicKey;
  const create_token_tx = new Transaction();

  create_token_tx.add(
    ...[
      await SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKey,
        space: MintLayout.span,
        lamports: await SPLToken.getMinBalanceRentForExemptMint(provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      await Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mintKey, DEFAULT_DECIMALS, wallet.publicKey, null),
    ]
  );

  const tokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintKey,
    wallet.publicKey,
    true
  );

  create_token_tx.add(
    ...[
      await Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintKey,
        tokenAccount,
        wallet.publicKey,
        wallet.publicKey
      ),
      // await Token.createMintToInstruction(
      //   TOKEN_PROGRAM_ID,
      //   mint,
      //   tokenAccount,
      //   wallet.publicKey,
      //   [],
      //   amount
      // )
    ]
  );

  const txHash = await sendTransaction(connection, wallet, create_token_tx, [mint]);

  return {
    mint: mintKey,
    tokenAccount,
    txHash,
  };
}
async function signAndSendTransactionEnvelope(connection: Connection, wallet: any, tx: TransactionEnvelope) {
  const signers: Keypair[] = tx.signers.map<Keypair>((item): Keypair => {
    return Keypair.fromSecretKey(item.secretKey);
  });
  return await sendTransaction(connection, wallet, new Transaction().add(...tx.instructions), signers);
}

export async function airdropSaberLP(connection: Connection, wallet: any) {
  const program = getProgramInstance(connection, wallet);
  const provider = program.provider;

  console.log('Creating token A');

  const { mint: mintA, tokenAccount: tokenAAccount } = await createMintAndAccount(
    connection,
    wallet,
    INITIAL_TOKEN_A_AMOUNT
  );
  console.log('Creating token B');
  const { mint: mintB, tokenAccount: tokenABccount } = await createMintAndAccount(
    connection,
    wallet,
    INITIAL_TOKEN_A_AMOUNT
  );
  console.log('Creating seedPoolAccounts');
  const seedPoolAccounts: ISeedPoolAccountsFn = ({ tokenAAccount, tokenBAccount }): TransactionInstructions => ({
    instructions: [
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintA,
        tokenAAccount,
        wallet.publicKey,
        [],
        INITIAL_TOKEN_A_AMOUNT
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintB,
        tokenBAccount,
        wallet.publicKey,
        [],
        INITIAL_TOKEN_B_AMOUNT
      ),
    ],
    signers: [],
  });

  console.log('Deploying new swap');
  /*
  const { swap: newSwap, initializeArgs } = await deployNewSwap({
    provider,
    swapProgramID: SWAP_PROGRAM_ID,
    adminAccount: wallet.publicKey,
    tokenAMint: mintA, // wrapped SOL
    tokenBMint: mintB, // mSOL
    ampFactor: new u64(AMP_FACTOR),
    fees: FEES,

    // initialLiquidityProvider: wallet.publicKey,
    useAssociatedAccountForInitialLP: false,
    seedPoolAccounts,

    // swapAccountSigner: stableSwapAccount,
  });*/
  const newSwapResult = await createInitializeNewSwapTx({
    provider,
    swapProgramID: SWAP_PROGRAM_ID,
    adminAccount: wallet.publicKey,
    tokenAMint: mintA, // wrapped SOL
    tokenBMint: mintB, // mSOL
    ampFactor: new u64(AMP_FACTOR),
    fees: FEES,

    // initialLiquidityProvider: wallet.publicKey,
    useAssociatedAccountForInitialLP: false,
    seedPoolAccounts,

    // swapAccountSigner: stableSwapAccount,
  });

  console.log('Setup SwapAccount 1');
  await signAndSendTransactionEnvelope(connection, wallet, newSwapResult.txs.setupAccounts1);
  console.log('Setup SwapAccount 2');
  await signAndSendTransactionEnvelope(connection, wallet, newSwapResult.txs.setupAccounts2);
  console.log('Initialzie SwapAccount');
  await signAndSendTransactionEnvelope(connection, wallet, newSwapResult.txs.initializeSwap);

  const lpMintKey = newSwapResult.initializeArgs.poolTokenMint;
  const poolMintToken = SToken.fromMint(lpMintKey, DEFAULT_DECIMALS);

  const airdrop_tx = new Transaction();
  console.log('Creating user wallet token A, B');

  const userTokenA = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintA,
    wallet.publicKey,
    true
  );
  const userTokenB = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintB,
    wallet.publicKey,
    true
  );
  airdrop_tx.add(
    ...[
      await Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintA,
        userTokenA,
        wallet.publicKey,
        wallet.publicKey
      ),
      await Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintA,
        userTokenA,
        wallet.publicKey,
        [],
        INITIAL_BASE_AMOUNT
      ),
    ]
  );

  airdrop_tx.add(
    ...[
      await Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintB,
        userTokenB,
        wallet.publicKey,
        wallet.publicKey
      ),
      await Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintB,
        userTokenB,
        wallet.publicKey,
        [],
        INITIAL_BASE_AMOUNT
      ),
    ]
  );

  await sendTransaction(connection, wallet, airdrop_tx, []);
  console.log('Depositing to Saber Pool', newSwapResult.initializeArgs.config.swapAccount);

  const deposit_tx = new Transaction();
  const userLPTokenKey = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    lpMintKey,
    wallet.publicKey,
    true
  );
  deposit_tx.add(
    ...[
      await Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        lpMintKey,
        userLPTokenKey,
        wallet.publicKey,
        wallet.publicKey
      ),

      newSwapResult.swap.deposit({
        userAuthority: wallet.publicKey,
        sourceA: userTokenA,
        sourceB: userTokenB,
        poolTokenAccount: userLPTokenKey,
        tokenAmountA: new u64(INITIAL_BASE_AMOUNT / 2),
        tokenAmountB: new u64(INITIAL_BASE_AMOUNT / 2),
        minimumPoolTokenAmount: new u64(0),
      }),
    ]
  );
  await sendTransaction(connection, wallet, deposit_tx, []);

  await createQuarry(connection, wallet, lpMintKey);

  return lpMintKey.toString();
}

export async function setRewarderAnnualRate(connection: Connection, wallet: any) {
  const program = getProgramInstance(connection, wallet);
  const provider = program.provider;

  const sdk: QuarrySDK = QuarrySDK.load({ provider });

  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);
  const rate_tx = rewarder.setAnnualRewards({
    newAnnualRate: new u64(1000_000_000),
  });
  // await rate_tx.confirm();
  await signAndSendTransactionEnvelope(connection, wallet, rate_tx);
}

export async function createQuarry(connection: Connection, wallet: any, mint: PublicKey | string) {
  const myTestLP = new PublicKey(mint);
  const poolMintToken = SToken.fromMint(myTestLP, DEFAULT_DECIMALS);

  const program = getProgramInstance(connection, wallet);
  const provider = program.provider;

  const sdk: QuarrySDK = QuarrySDK.load({ provider });

  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);
  console.log('Creating Quarry');

  const { quarry: quarryKey, tx: txQuarry } = await rewarder.createQuarry({
    // token: baseToken,
    token: poolMintToken,
  });
  let tx = await signAndSendTransactionEnvelope(connection, wallet, txQuarry);
  await sleep(1000);
  console.log('Setting RewardsShare');

  const quarry = await rewarder.getQuarry(poolMintToken);
  const share_tx = await quarry.setRewardsShare(new u64(10_000));
  // share_tx.confirm();
  tx = await signAndSendTransactionEnvelope(connection, wallet, share_tx);
  console.log('Set RewardsShare', tx);
}

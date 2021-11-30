import idl from './ratio-faucet-idl.json';

import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import {
  Connection,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { checkWalletATA, createAssociatedTokenAccountIfNotExist, sendTransaction } from './web3';
import { FAUCET_PROGRAM_ID } from './ids';

const FAUCET_IDL = idl;
const FAUCET_TAG = 'faucet-seed';
const LP_USDC_USDR_TAG = 'lp-usdc-usdr-seed';
const LP_ETH_SOL_TAG = 'lp-eth-sol-seed';
const LP_ATLAS_RAY_TAG = 'lp-atlas-ray-seed';
const LP_SAMO_RAY_TAG = 'lp-samo-ray-seed';

// This command makes an Lottery
function getProgramInstance(connection: Connection, wallet: any) {
  // if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions());
  // Read the generated IDL.
  const idl = FAUCET_IDL as any;

  // Address of the deployed program.
  const programId = FAUCET_PROGRAM_ID;

  // Generate the program client from IDL.
  const program = new (anchor as any).Program(idl, programId, provider);

  return program;
}
export async function isFaucetStateCreated(connection: Connection, wallet: any) {
  try {
    const program = getProgramInstance(connection, wallet);
    const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(FAUCET_TAG)],
      program.programId
    );
    const globalState = await program.account.faucet.fetch(globalStateKey);
    if (globalState) {
      return true;
    }
  } catch (e) {
    console.log('faucet was not created');
  }
  return false;
}
// This command makes an Lottery
export async function createFaucetState(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(FAUCET_TAG)],
    program.programId
  );
  console.log('globalStateKey', globalStateKey.toBase58());

  const [usdcUsdrKey, usdcUsdrKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_USDC_USDR_TAG)],
    program.programId
  );
  console.log('usdcUsdrKey', usdcUsdrKey.toBase58());

  const [ethSolKey, ethSolKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_ETH_SOL_TAG)],
    program.programId
  );
  console.log('ethSolKey', ethSolKey.toBase58());

  const [atlasRayKey, atlasRayKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_ATLAS_RAY_TAG)],
    program.programId
  );
  console.log('atlasRayKey', atlasRayKey.toBase58());

  const [samoRayKey, samoRayKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_SAMO_RAY_TAG)],
    program.programId
  );
  console.log('samoRay', samoRayKey.toBase58());

  try {
    const globalState = await program.account.faucet.fetch(globalStateKey);
    console.log('already created');
    console.log('globalState', globalState);
    console.log('already created');
    return;
  } catch (e) {
    console.log('not created');
  }

  try {
    await program.rpc.createState(
      globalStateNonce,
      usdcUsdrKeyNonce,
      ethSolKeyNonce,
      atlasRayKeyNonce,
      samoRayKeyNonce,
      {
        accounts: {
          superOwner: wallet.publicKey,
          faucetState: globalStateKey,
          mintUsdcUsdrLp: usdcUsdrKey,
          mintEthSolLp: ethSolKey,
          mintAtlasRayLp: atlasRayKey,
          mintSamoRayLp: samoRayKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      }
    );
  } catch (e) {
    console.log(e);
    console.log('can not create global state');
  }
}

export async function faucetUsdcUsdrLp(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(FAUCET_TAG)],
    program.programId
  );

  const [lpMintKey, lpMintKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_USDC_USDR_TAG)],
    program.programId
  );

  const paramUserKey = await checkWalletATA(connection, wallet.publicKey, lpMintKey.toBase58());

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const userTokenKey = await createAssociatedTokenAccountIfNotExist(
    paramUserKey,
    wallet.publicKey,
    lpMintKey.toBase58(),
    transaction
  );

  console.log('lpMintKeyc', lpMintKey.toString());
  const mintInstruction = await program.instruction.faucetUsdcUsdrLp(globalStateNonce, lpMintKeyNonce, {
    accounts: {
      owner: wallet.publicKey,
      faucetState: globalStateKey,
      mintLp: lpMintKey,
      userTokenLp: userTokenKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
  transaction.add(mintInstruction);

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
}

export async function faucetEthSolLp(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(FAUCET_TAG)],
    program.programId
  );

  const [lpMintKey, lpMintKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_ETH_SOL_TAG)],
    program.programId
  );

  const paramUserKey = await checkWalletATA(connection, wallet.publicKey, lpMintKey.toBase58());

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const userTokenKey = await createAssociatedTokenAccountIfNotExist(
    paramUserKey,
    wallet.publicKey,
    lpMintKey.toBase58(),
    transaction
  );

  console.log('lpMintKeyc', lpMintKey.toString());
  const mintInstruction = await program.instruction.faucetEthSolLp(globalStateNonce, lpMintKeyNonce, {
    accounts: {
      owner: wallet.publicKey,
      faucetState: globalStateKey,
      mintLp: lpMintKey,
      userTokenLp: userTokenKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
  transaction.add(mintInstruction);

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
}

export async function faucetAtlasRayLp(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(FAUCET_TAG)],
    program.programId
  );

  const [lpMintKey, lpMintKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_ATLAS_RAY_TAG)],
    program.programId
  );

  const paramUserKey = await checkWalletATA(connection, wallet.publicKey, lpMintKey.toBase58());

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const userTokenKey = await createAssociatedTokenAccountIfNotExist(
    paramUserKey,
    wallet.publicKey,
    lpMintKey.toBase58(),
    transaction
  );

  console.log('lpMintKeyc', lpMintKey.toString());
  const mintInstruction = await program.instruction.faucetAtlasRayLp(globalStateNonce, lpMintKeyNonce, {
    accounts: {
      owner: wallet.publicKey,
      faucetState: globalStateKey,
      mintLp: lpMintKey,
      userTokenLp: userTokenKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
  transaction.add(mintInstruction);

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
}

export async function faucetSamoRayLp(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(FAUCET_TAG)],
    program.programId
  );

  const [lpMintKey, lpMintKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(LP_SAMO_RAY_TAG)],
    program.programId
  );

  const paramUserKey = await checkWalletATA(connection, wallet.publicKey, lpMintKey.toBase58());

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const userTokenKey = await createAssociatedTokenAccountIfNotExist(
    paramUserKey,
    wallet.publicKey,
    lpMintKey.toBase58(),
    transaction
  );

  console.log('lpMintKeyc', lpMintKey.toString());
  const mintInstruction = await program.instruction.faucetSamoRayLp(globalStateNonce, lpMintKeyNonce, {
    accounts: {
      owner: wallet.publicKey,
      faucetState: globalStateKey,
      mintLp: lpMintKey,
      userTokenLp: userTokenKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
  transaction.add(mintInstruction);

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
}

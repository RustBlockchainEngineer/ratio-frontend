/* eslint-disable prettier/prettier */
import idl from './ratio-lending-idl.json';

import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
const { BN } = anchor;
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import {
  checkWalletATA,
  createAssociatedTokenAccountIfNotExist,
  createTokenAccountIfNotExist,
  sendTransaction,
} from './web3';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import { STABLE_POOL_PROGRAM_ID } from './ids';
import { getTokenBySymbol } from './tokens';
import usdrIcon from '../assets/images/USDr.png';
import { sleep } from './utils';
import { calculateSaberReward, createSaberTokenVault } from './saber/saber-utils';

export const DEPOSIT_ACTION = 'deposit';
export const HARVEST_ACTION = 'harvest';
export const WIHTDRAW_ACTION = 'withdraw';
export const BORROW_ACTION = 'borrow';
export const PAYBACK_ACTION = 'payback';
export const HISTORY_TO_SHOW = 5;
export declare type PlatformType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const TYPE_ID_RAYDIUM: PlatformType = 0;
export const TYPE_ID_ORCA: PlatformType = 1;
export const TYPE_ID_SABER: PlatformType = 0;
export const TYPE_ID_MERCURIAL: PlatformType = 3;
export const TYPE_ID_UNKNOWN: PlatformType = 4;

export const WSOL_MINT_KEY = new PublicKey('So11111111111111111111111111111111111111112');

export const GLOBAL_STATE_TAG = 'GLOBAL_STATE_TAG';
export const VAULT_SEED = 'VAULT_SEED';
export const TROVE_SEED = 'TROVE_SEED';
export const MINT_USD_SEED = 'MINT_USD_SEED';
export const USD_TOKEN_SEED = 'USD_TOKEN_SEED';
export const TROVE_POOL_SEED = 'TROVE_POOL_SEED';
export const PRICE_FEED_TAG = 'price-feed';

export const STABLE_POOL_IDL = idl;
export const USD_DECIMALS = 6;
export const USDR_MINT_KEY = 'HEKMCQDijwc1yjcJtQLTbwZT5R2q8rQZzrr3dMv9xfS5';
export const defaultPrograms = {
  systemProgram: SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  rent: SYSVAR_RENT_PUBKEY,
  clock: SYSVAR_CLOCK_PUBKEY,
};

export const GLOBAL_TVL_LIMIT = 1_000_000_000_000;
export const GLOBAL_DEBT_CEILING = 1500_000_000;
export const USER_DEBT_CEILING = 1500_000_000;

export const TOKEN_VAULT_OPTIONS = [
  {
    value: 'USDC-CASH',
    label: 'USDC-CASH LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/FZE52MWasDcwNeQfBL6PUHjvYgQMthvHNX5e7xUDN56T/logo.png`,
    ],
    mintAddress: 'FZE52MWasDcwNeQfBL6PUHjvYgQMthvHNX5e7xUDN56T',
  },
  {
    value: 'USDC-PAI',
    label: 'USDC-PAI LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7gJWEW3vGDgUNbg3agG9DSSkb271tpk82K4ixAGXeuoh/logo.png`,
    ],
    mintAddress: '7gJWEW3vGDgUNbg3agG9DSSkb271tpk82K4ixAGXeuoh',
  },
  {
    value: 'USDC-USDT',
    label: 'USDC-USDT LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HXb1AM83cRUbGegTivuSanvLP1W8A4pyTGMveNWR1pyg/logo.png`,
    ],
    mintAddress: 'HXb1AM83cRUbGegTivuSanvLP1W8A4pyTGMveNWR1pyg',
  },
  {
    value: 'USDT-CASH',
    label: 'USDT-CASH LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9RBrjJLKK7xm5275iNHPDdtMEN3nZFhPDiUkZGmkTUrd/logo.png`,
    ],
    mintAddress: '9RBrjJLKK7xm5275iNHPDdtMEN3nZFhPDiUkZGmkTUrd',
  },
];

// This command makes an Lottery
export function getProgramInstance(connection: Connection, wallet: any) {
  // if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions());
  // Read the generated IDL.
  const idl = STABLE_POOL_IDL as any;

  // Address of the deployed program.
  const programId = STABLE_POOL_PROGRAM_ID;

  // Generate the program client from IDL.
  const program = new (anchor as any).Program(idl, programId, provider);

  return program;
}

async function retrieveGlobalState(connection: Connection, wallet: any) {
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const globalState = await program.account.globalState.fetch(globalStateKey);
  return { globalState, globalStateKey };
}

export async function getGlobalStateKey() {
  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    STABLE_POOL_PROGRAM_ID
  );
  return globalStateKey;
}

export async function getGlobalState(connection: Connection, wallet: any) {
  try {
    const { globalState, globalStateKey } = await retrieveGlobalState(connection, wallet);
    if (globalState) {
      return { globalState, globalStateKey };
    } else {
      throw new Error(`Global state doesn't exist`);
    }
  } catch (e) {
    console.log('globalState was not created');
    throw e;
  }
}

export async function getCurrentSuperOwner(connection: Connection, wallet: any): Promise<PublicKey> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.authority;
  } catch (e) {
    console.error('Error while fetching the super owner');
    throw e;
  }
}

export async function isGlobalStateCreated(connection: Connection, wallet: any) {
  try {
    const globalState = await retrieveGlobalState(connection, wallet);
    if (globalState) {
      return true;
    }
    return false;
  } catch (e) {
    console.log('globalState was not created');
    return false;
  }
}

export async function getUserState(connection: Connection, wallet: any, mintCollKey: PublicKey|string) {
  if (!wallet || !wallet.publicKey || !mintCollKey) {
    return null;
  }
  const program = getProgramInstance(connection, wallet);

  const tokenVaultKey = await getTokenVaultAddress(mintCollKey);
  if (!tokenVaultKey) {
    return null;
  }
  const [userTroveKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  try {
    return await program.account.trove.fetch(userTroveKey);
  } catch (e) {
    return null;
  }
}

export async function borrowUSDr(
  connection: Connection,
  wallet: any,
  amount: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [mintUsdKey, mintUsdNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(MINT_USD_SEED)],
    program.programId
  );

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const [userUsdKey, userUsdKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_TOKEN_SEED), wallet.publicKey.toBuffer(), mintUsdKey.toBuffer()],
    program.programId
  );

  const [priceFeedKey, priceFeedBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(PRICE_FEED_TAG), mintCollKey.toBuffer()],
    program.programId
  );

  // todo - get real tokenA, B, C
  // FIXME: hardcoded
  const mintA = new PublicKey('7KLQxufDu9H7BEAHvthC5p4Uk6WrH3aw8TwvPXoLgG11');
  const mintB = new PublicKey('BicnAQ4jQgz3g7htuq1y6SKUNtrTr7UmpQjCqnTKkHR5');
  const mintC = new PublicKey('FnjuEcDDTL3e511XE5a7McbDZvv2sVfNfEjyq4fJWXxg');
  const vaultA = new PublicKey('F8kPn8khukSVp4xwvHGiWUc6RnCScFbACdXJmyEaWWxX');
  const vaultB = new PublicKey('3ZFPekrEr18xfPMUFZDnyD6ZPrKGB539BzM8uRFmwmBa');
  const vaultC = new PublicKey('435X8hbABi3xGzBTqAZ2ehphwibk4dQrjRFSXE7uqvrc');

  console.log('priceFeedKey =', priceFeedKey.toBase58());
  const ix1 = program.instruction.updatePriceFeed({
    accounts: {
      priceFeed: priceFeedKey,
      mintColl: mintCollKey,
      vaultA,
      vaultB,
      vaultC,
      ...defaultPrograms,
    },
  });
  const borrowInstruction = program.instruction.borrowUsd(new anchor.BN(amount), userUsdKeyNonce, {
    accounts: {
      authority: wallet.publicKey,
      vault: tokenVaultKey,
      trove: userTroveKey,
      globalState: globalStateKey,
      priceFeed: priceFeedKey,
      mintUsd: mintUsdKey,
      ataUserUsd: userUsdKey,
      mintColl: mintCollKey,
      ...defaultPrograms,
    },
  });

  transaction.add(ix1);
  transaction.add(borrowInstruction);

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User borrowed ' + amount / Math.pow(10, USD_DECIMALS) + ' USD , transaction id = ' + tx;
}

export async function getTokenVaultByMint(connection: Connection, mint: string| PublicKey) : Promise<any | undefined> {
  const program = getProgramInstance(connection, null);
  const tokenVaultKey = await getTokenVaultAddress(mint);
  try {
    const tokenVault = await program.account.vault.fetch(tokenVaultKey);
    return { tokenVault, tokenVaultKey };
  } catch (e) {
    return null;
  }
}

export async function getTokenVaultAddress(mint: string | PublicKey): Promise<PublicKey | undefined> {
  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), new PublicKey(mint).toBuffer()],
    STABLE_POOL_PROGRAM_ID
  );
  return tokenVaultKey;
}

export async function getTokenVaultAddressByPublicKeyMint(
  connection: Connection,
  mint: PublicKey
): Promise<PublicKey | undefined> {
  const res = await getTokenVaultAndAddressByPublicKeyMint(connection, mint);
  return res?.tokenVaultKey;
}

export async function createUserTrove(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey = WSOL_MINT_KEY,
  debtCeil = 100_000_000_000
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );

  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  try {
    const userTrove = await program.account.trove.fetch(userTroveKey);
    console.log('fetched userTrove', userTrove);
    console.log('This user trove was already created!');
    return 'already created!';
  } catch (e) {}

  try {
    await program.rpc.createTrove(userTroveNonce, userTroveTokenVaultNonce, {
      accounts: {
        vault: tokenVaultKey,
        trove: userTroveKey,

        authority: wallet.publicKey,

        ataTrove: userTroveTokenVaultKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    });
  } catch (e) {
    console.log("can't create user trove");
  }
  return 'created user trove successfully!';
}

export async function depositCollateral(
  connection: Connection,
  wallet: any,
  amount: number,
  userCollAddress: string | null = null,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  let userCollKey = null;

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  userCollKey = await createTokenAccountIfNotExist(
    program.provider.connection,
    userCollAddress,
    wallet.publicKey,
    mintCollKey.toBase58(),
    accountRentExempt,
    transaction,
    signers
  );

  try {
    await program.account.trove.fetch(userTroveKey);
  } catch {
    const tx = await program.instruction.createTrove(userTroveNonce, tokenVaultNonce, {
      accounts: {
        authority: wallet.publicKey,
        trove: userTroveKey,
        vault: tokenVaultKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    });
    transaction.add(tx);
  }

  const depositInstruction = await program.instruction.depositCollateral(new anchor.BN(amount), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      vault: tokenVaultKey,
      trove: userTroveKey,
      ataTrove: userTroveTokenVaultKey,
      ataUserColl: userCollKey,
      mintColl: mintCollKey,
      ...defaultPrograms,
    },
  });

  transaction.add(depositInstruction);

  if (mintCollKey.toBase58() === WSOL_MINT_KEY.toBase58()) {
    transaction.add(
      closeAccount({
        source: userCollKey,
        destination: wallet.publicKey,
        owner: wallet.publicKey,
      })
    );
  }

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User deposited ' + amount / Math.pow(10, 6) + ' SOL, transaction id = ' + tx;
}

export async function getUsdrMintKey() {
  const [mintUsdKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(MINT_USD_SEED)],
    STABLE_POOL_PROGRAM_ID
  );
  return mintUsdKey.toBase58();
}

export async function repayUSDr(
  connection: Connection,
  wallet: any,
  amount: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [mintUsdKey, mintUsdNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(MINT_USD_SEED)],
    program.programId
  );

  const transaction = new Transaction();
  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  const [userUsdKey, userUsdKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_TOKEN_SEED), wallet.publicKey.toBuffer(), mintUsdKey.toBuffer()],
    program.programId
  );

  const repayInstruction = await program.instruction.repayUsd(new anchor.BN(amount), {
    accounts: {
      owner: wallet.publicKey,
      vault: tokenVaultKey,
      trove: userTroveKey,
      globalState: globalStateKey,
      mintUsd: mintUsdKey,
      ataUserUsd: userUsdKey,
      mintColl: mintCollKey,
      ...defaultPrograms,
    },
  });
  instructions.push(repayInstruction);

  instructions.forEach((instruction) => {
    transaction.add(instruction);
  });

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User repaid ' + amount / Math.pow(10, USD_DECIMALS) + ' USD , transaction id = ' + tx;
}

export async function withdrawCollateral(
  connection: Connection,
  wallet: any,
  amount: number,
  userCollAddress: string | null = null,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const globalState = await program.account.globalState.fetch(globalStateKey);
  console.log('fetched globalState', globalState);

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const transaction = new Transaction();
  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  let userCollKey = null;

  userCollKey = await createTokenAccountIfNotExist(
    program.provider.connection,
    userCollAddress,
    wallet.publicKey,
    mintCollKey.toBase58(),
    null,
    transaction,
    signers
  );

  const withdrawInstruction = await program.instruction.withdrawCollateral(new anchor.BN(amount), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      trove: userTroveKey,
      vault: tokenVaultKey,
      ataTrove: userTroveTokenVaultKey,
      ataUserColl: userCollKey,
      mintColl: mintCollKey,
      ...defaultPrograms,
    },
  });
  instructions.push(withdrawInstruction);

  if (mintCollKey.toBase58() === WSOL_MINT_KEY.toBase58()) {
    instructions.push(
      closeAccount({
        source: userCollKey,
        destination: wallet.publicKey,
        owner: wallet.publicKey,
      })
    );
  }
  instructions.forEach((instruction) => {
    transaction.add(instruction);
  });

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User withdrawed ' + amount / Math.pow(10, 6) + ' SOL, transaction id = ' + tx;
}

export function pushUserHistory(action: string, userKey: string, mintKey: string, txHash: string, amount: number) {
  if (!window.localStorage[action]) {
    window.localStorage[action] = JSON.stringify({});
  }
  const actions = JSON.parse(window.localStorage[action]);

  if (!actions[userKey]) {
    actions[userKey] = {};
  }

  if (!actions[userKey][mintKey]) {
    actions[userKey][mintKey] = [];
  }

  actions[userKey][mintKey].splice(0, 0, {
    time: new Date().getTime(),
    amount,
    txHash,
  });

  window.localStorage[action] = JSON.stringify(actions);
}

export function getUserHistory(action: string, userKey: string, mintKey: string) {
  const actions = JSON.parse(window.localStorage[action]);

  if (actions && actions[userKey] && actions[userKey][mintKey]) {
    return actions[userKey][mintKey].slice(0, HISTORY_TO_SHOW);
  }
  return [];
}

export async function calculateRewardByPlatform(connection: Connection, wallet: any, mintCollKey: string| PublicKey, platformType: number) {
  if (platformType === TYPE_ID_SABER) {
    return await calculateSaberReward(connection, wallet, new PublicKey(mintCollKey));
  }
  return 0;
}
/* eslint-disable prettier/prettier */
import idl from './stable-pool-idl.json';

import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
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
import { createTokenAccountIfNotExist, sendTransaction } from './web3';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import { STABLE_POOL_PROGRAM_ID } from './ids';
import { calculateSaberReward } from './saber/saber-utils';
import { PRICE_DECIMAL } from '../constants';

export const DEPOSIT_ACTION = 'deposit';
export const HARVEST_ACTION = 'harvest';
export const WIHTDRAW_ACTION = 'withdraw';
export const BORROW_ACTION = 'borrow';
export const PAYBACK_ACTION = 'payback';
export const HISTORY_TO_SHOW = 5;
export declare type PlatformType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const TYPE_ID_RAYDIUM: PlatformType = 0;
export const TYPE_ID_ORCA: PlatformType = 1;
export const TYPE_ID_SABER: PlatformType = 2;
export const TYPE_ID_MERCURIAL: PlatformType = 3;
export const TYPE_ID_UNKNOWN: PlatformType = 4;

export const WSOL_MINT_KEY = new PublicKey('So11111111111111111111111111111111111111112');

export const GLOBAL_STATE_TAG = 'GLOBAL_STATE_TAG';
export const POOL_SEED = 'POOL_SEED';
export const VAULT_SEED = 'VAULT_SEED';
export const MINT_USD_SEED = 'MINT_USD_SEED';
export const USD_TOKEN_SEED = 'USD_TOKEN_SEED';
export const VAULT_POOL_SEED = 'VAULT_POOL_SEED';
export const PRICE_FEED_TAG = 'price-feed';
export const USER_STATE_SEED = 'USER_STATE_SEED';

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
export const POOL_DEBT_CEILING = 1500_000_000;

// TODO THIS IS A TEMPORARY ADDRESS THAT LINKS TO NOTHING, DELETE ONCE ORACLE REPORTER IS IMPLEMENTED
export const ORACLE_REPORTER = new PublicKey('CfmVBs4jbNQNtNMn5iHkA4upHBUVuTqAkpGqRV3k4hRh');

export const mintA = new PublicKey('7KLQxufDu9H7BEAHvthC5p4Uk6WrH3aw8TwvPXoLgG11');
export const mintB = new PublicKey('BicnAQ4jQgz3g7htuq1y6SKUNtrTr7UmpQjCqnTKkHR5');
export const mintC = new PublicKey('FnjuEcDDTL3e511XE5a7McbDZvv2sVfNfEjyq4fJWXxg');
export const NUM_MINT_DECIAMLS = 6;
// const poolA = new PublicKey('F8kPn8khukSVp4xwvHGiWUc6RnCScFbACdXJmyEaWWxX');
// const poolB = new PublicKey('3ZFPekrEr18xfPMUFZDnyD6ZPrKGB539BzM8uRFmwmBa');
// const poolC = new PublicKey('435X8hbABi3xGzBTqAZ2ehphwibk4dQrjRFSXE7uqvrc');

export const TOKEN_POOL_OPTIONS = [
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

export async function getUserStateKey(wallet: any) {
  const [userStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_STATE_SEED), wallet.publicKey.toBuffer()],
    STABLE_POOL_PROGRAM_ID
  );
  return userStateKey;
}

export async function getUserState(connection: Connection, wallet: any) {
  if (!wallet || !wallet.publicKey) {
    return null;
  }
  const program = getProgramInstance(connection, wallet);

  const userStateKey = getUserStateKey(wallet);
  try {
    return await program.account.userState.fetch(userStateKey);
  } catch (e) {
    return null;
  }
}

// createUserState
export async function createUserState(connection: Connection, wallet: any) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);

  const userStateKey = getUserStateKey(wallet);
  const userState = getUserState(connection, wallet);

  if (userState) {
    console.log('user state already created');
    console.log('user state', userState);
    return 'already created';
  }

  try {
    await program.rpc.createUserState(
      {
        accounts: {
          authority: wallet.publicKey,
          userState: userStateKey
        }
      }
    );
  } catch (e) {
    console.log("can't create user state");
    console.error(e);
  }
  return 'created user state';
}

export async function borrowUSDr(
  connection: Connection,
  wallet: any,
  amount: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );

  const [tokenPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(POOL_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), tokenPoolKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [mintUsdKey] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(MINT_USD_SEED)], program.programId);

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const [userUsdKey, userUsdKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_TOKEN_SEED), wallet.publicKey.toBuffer(), mintUsdKey.toBuffer()],
    program.programId
  );

  const [priceFeedKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(PRICE_FEED_TAG), mintCollKey.toBuffer()],
    program.programId
  );

  // todo - get real tokenA, B, C
  // FIXME: hardcoded
  const poolA = new PublicKey('F8kPn8khukSVp4xwvHGiWUc6RnCScFbACdXJmyEaWWxX');
  const poolB = new PublicKey('3ZFPekrEr18xfPMUFZDnyD6ZPrKGB539BzM8uRFmwmBa');
  const poolC = new PublicKey('435X8hbABi3xGzBTqAZ2ehphwibk4dQrjRFSXE7uqvrc');

  console.log('priceFeedKey =', priceFeedKey.toBase58());
  const ix1 = program.instruction.updatePriceFeed({
    accounts: {
      priceFeed: priceFeedKey,
      mintColl: mintCollKey,
      poolA,
      poolB,
      poolC,
      ...defaultPrograms,
    },
  });
  const borrowInstruction = program.instruction.borrowUsd(new anchor.BN(amount), userUsdKeyNonce, {
    accounts: {
      authority: wallet.publicKey,
      pool: tokenPoolKey,
      vault: userVaultKey,
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

  const txHash = await sendTransaction(connection, wallet, transaction, signers);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log(`User borrowed ${amount / Math.pow(10, USD_DECIMALS)} USD , transaction id = ${txHash}`);

  return txHash;
}

export async function getTokenPoolByMint(connection: Connection, mint: string | PublicKey): Promise<any | undefined> {
  const program = getProgramInstance(connection, null);
  const tokenPoolKey = await getTokenPoolAddress(mint);
  try {
    const tokenPool = await program.account.pool.fetch(tokenPoolKey);
    return tokenPool;
  } catch (e) {
    return null;
  }
}

export async function getTokenPoolAddress(mint: string | PublicKey): Promise<PublicKey | undefined> {
  const [tokenPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(POOL_SEED), new PublicKey(mint).toBuffer()],
    STABLE_POOL_PROGRAM_ID
  );
  return tokenPoolKey;
}

export async function createUserVault(connection: Connection, wallet: any, mintCollKey: PublicKey = WSOL_MINT_KEY) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [tokenPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(POOL_SEED), mintCollKey.toBuffer()],
    program.programId
  );

  const [userVaultKey, userVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), tokenPoolKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userVaultTokenPoolKey, userVaultTokenPoolNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_POOL_SEED), userVaultKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  try {
    const userVault = await program.account.vault.fetch(userVaultKey);
    console.log('fetched userVault', userVault);
    console.log('This user vault was already created!');
    return 'already created!';
  } catch (e) {
    console.error(e);
  }

  try {
    await program.rpc.createVault(userVaultNonce, userVaultTokenPoolNonce, {
      accounts: {
        pool: tokenPoolKey,
        vault: userVaultKey,
        authority: wallet.publicKey,
        ataVault: userVaultTokenPoolKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    });
  } catch (e) {
    console.log("can't create user vault");
  }
  return 'created user vault successfully!';
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
  const [tokenPoolKey, tokenPoolNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(POOL_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userVaultKey, userVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), tokenPoolKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const [userVaultTokenPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_POOL_SEED), userVaultKey.toBuffer(), mintCollKey.toBuffer()],
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
    await program.account.vault.fetch(userVaultKey);
  } catch {
    const tx = await program.instruction.createVault(userVaultNonce, tokenPoolNonce, {
      accounts: {
        authority: wallet.publicKey,
        vault: userVaultKey,
        pool: tokenPoolKey,
        ataVault: userVaultTokenPoolKey,
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
      pool: tokenPoolKey,
      vault: userVaultKey,
      ataVault: userVaultTokenPoolKey,
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

  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(POOL_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), tokenPoolKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [mintUsdKey] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(MINT_USD_SEED)], program.programId);

  const transaction = new Transaction();
  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  const [userUsdKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_TOKEN_SEED), wallet.publicKey.toBuffer(), mintUsdKey.toBuffer()],
    program.programId
  );

  const repayInstruction = await program.instruction.repayUsd(new anchor.BN(amount), {
    accounts: {
      owner: wallet.publicKey,
      pool: tokenPoolKey,
      vault: userVaultKey,
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

  const txHash = await sendTransaction(connection, wallet, transaction, signers);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log(`User repaid ${amount / Math.pow(10, USD_DECIMALS)} USD , transaction id = ${txHash}`);

  return txHash;
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

  const [tokenPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(POOL_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), tokenPoolKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userVaultTokenPoolKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_POOL_SEED), userVaultKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const transaction = new Transaction();
  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  const userCollKey = await createTokenAccountIfNotExist(
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
      vaultt: userVaultKey,
      pool: tokenPoolKey,
      ataVault: userVaultTokenPoolKey,
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

export async function calculateRewardByPlatform(
  connection: Connection,
  wallet: any,
  mintCollKey: string | PublicKey,
  platformType: number
) {
  let reward = 0;
  if (platformType === TYPE_ID_SABER) {
    reward = await calculateSaberReward(connection, wallet, new PublicKey(mintCollKey));
  }

  return parseFloat(reward.toFixed(PRICE_DECIMAL));
}

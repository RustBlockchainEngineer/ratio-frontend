/* eslint-disable prettier/prettier */
import { IDL } from './stable-pool';

import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { sendTransaction } from './web3';
import { STABLE_POOL_PROGRAM_ID } from './ids';
import { calculateSaberReward } from './saber/saber-utils';
import { PRICE_DECIMAL } from '../constants';
import {
  getATAKey,
  getGlobalStatePDA,
  getOraclePDA,
  getPoolPDA,
  getUSDrMintKey,
  getUserStatePDA,
  getVaultPDA,
  getVaultPDAWithBump,
} from './ratio-pda';
import { DECIMALS_USDT } from './constants';
import { Program } from '@project-serum/anchor';

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

export const USD_DECIMALS = 6;
export const USDR_MINT_KEY = getUSDrMintKey().toString();
export const defaultPrograms = {
  systemProgram: SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  rent: SYSVAR_RENT_PUBKEY,
  clock: SYSVAR_CLOCK_PUBKEY,
};

export const GLOBAL_TVL_LIMIT = 1_000_000_000_000;
export const GLOBAL_DEBT_CEILING = 1500_000_000;
export const USER_DEBT_CEILING = 1500_000_000;
export const POOL_DEBT_CEILING = 1500_000_000;

// TODO THIS IS A TEMPORARY ADDRESS THAT LINKS TO NOTHING, DELETE ONCE ORACLE REPORTER IS IMPLEMENTED
export const ORACLE_REPORTER = new PublicKey('7Lw3e19CJUvR5qWRj8J6NKrV2tywiJqS9oDu1m8v4rsi');

export const mintA = new PublicKey('7KLQxufDu9H7BEAHvthC5p4Uk6WrH3aw8TwvPXoLgG11');
export const mintB = new PublicKey('BicnAQ4jQgz3g7htuq1y6SKUNtrTr7UmpQjCqnTKkHR5');
export const mintC = new PublicKey('FnjuEcDDTL3e511XE5a7McbDZvv2sVfNfEjyq4fJWXxg');
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

  // Address of the deployed program.
  const programId = STABLE_POOL_PROGRAM_ID;

  // Generate the program client from IDL.
  const program = new Program(IDL, programId, provider);

  return program;
}

async function retrieveGlobalState(connection: Connection, wallet: any) {
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = getGlobalStatePDA();
  const globalState = await program.account.globalState.fetch(globalStateKey);
  return { globalState, globalStateKey };
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

export async function getUserState(connection: Connection, wallet: any) {
  if (!wallet || !wallet.publicKey) {
    return null;
  }
  const program = getProgramInstance(connection, wallet);

  const userStateKey = getUserStatePDA(wallet.publicKey);
  try {
    return await program.account.userState.fetch(userStateKey);
  } catch (e) {
    return null;
  }
}

export async function getVaultState(connection: Connection, wallet: any, mintCollat: string | PublicKey) {
  if (!wallet || !wallet.publicKey) {
    return null;
  }
  const program = getProgramInstance(connection, wallet);

  const vaultKey = getVaultPDA(wallet.publicKey, new PublicKey(mintCollat));
  try {
    return await program.account.vault.fetch(vaultKey);
  } catch (e) {
    return null;
  }
}

export async function borrowUSDr(connection: Connection, wallet: any, amount: number, mintCollat: PublicKey) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const usdrMint = getUSDrMintKey();
  const poolKey = getPoolPDA(mintCollat);
  const poolData = await program.account.pool.fetch(poolKey);

  const oracleMintA = poolData.swapMintA;
  const oracleMintB = poolData.swapMintB;
  const oracleAKey = getOraclePDA(oracleMintA);
  const oracleBKey = getOraclePDA(oracleMintB);

  const swapTokenA = poolData.swapTokenA;
  const swapTokenB = poolData.swapTokenB;

  const ataUSDr = getATAKey(wallet.publicKey, usdrMint);

  const vaultKey = getVaultPDA(wallet.publicKey, mintCollat);
  const userStateKey = getUserStatePDA(wallet.publicKey);

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const borrowInstruction = await program.instruction.borrowUsdr(new anchor.BN(amount), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,

      pool: poolKey,
      vault: vaultKey,
      userState: userStateKey,
      oracleA: oracleAKey,
      oracleB: oracleBKey,
      swapTokenA,
      swapTokenB,

      mintCollat,

      mintUsdr: usdrMint,
      ataUsdr: ataUSDr,
      ...defaultPrograms,
    },
  });

  transaction.add(borrowInstruction);

  const txHash = await sendTransaction(connection, wallet, transaction, signers);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log(`User borrowed ${amount / Math.pow(10, DECIMALS_USDT)} USD , transaction id = ${txHash}`);

  return txHash;
}

export async function getLendingPoolByMint(connection: Connection, mint: string | PublicKey): Promise<any | undefined> {
  const program = getProgramInstance(connection, null);
  const tokenPoolKey = getPoolPDA(mint);
  try {
    const tokenPool = await program.account.pool.fetch(tokenPoolKey);
    return tokenPool;
  } catch (e) {
    return null;
  }
}

export async function depositCollateral(
  connection: Connection,
  wallet: any,
  amount: number,
  mintCollat: PublicKey,
  userTokenATA: PublicKey,

  needTx = false
) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintCollat);

  const poolData = await program.account.pool.fetch(poolKey);

  const oracleMintA = poolData.swapMintA;
  const oracleMintB = poolData.swapMintB;

  const swapTokenA = poolData.swapTokenA;
  const swapTokenB = poolData.swapTokenB;

  const oracleAKey = getOraclePDA(oracleMintA);
  const oracleBKey = getOraclePDA(oracleMintB);

  const rewardMint = poolData.mintReward;

  const [vaultKey, vaultBump] = getVaultPDAWithBump(wallet.publicKey, mintCollat);
  const userStateKey = getUserStatePDA(wallet.publicKey);

  const vaultATAKey = getATAKey(vaultKey, mintCollat);

  const transaction = new Transaction();

  try {
    await program.account.userState.fetch(userStateKey);
  } catch {
    console.log('creating user state');
    transaction.add(
      program.instruction.createUserState({
        accounts: {
          authority: wallet.publicKey,
          userState: userStateKey,
          ...defaultPrograms,
        },
      })
    );
  }
  try {
    await program.account.vault.fetch(vaultKey);
  } catch {
    console.log('creating vault');
    const tx = await program.instruction.createVault(vaultBump, {
      accounts: {
        // account that owns the vault
        authority: wallet.publicKey,
        // state account where all the platform funds go thru or maybe are stored
        pool: poolKey,
        // the user's vault is the authority for the collateral tokens within it
        vault: vaultKey,
        // this is the vault's ATA for the collateral's mint, previously named tokenColl
        ataCollatVault: vaultATAKey,
        // the mint address for the specific collateral provided to this vault
        mintCollat: mintCollat,
        ...defaultPrograms,
      },
    });
    transaction.add(tx);
    console.log('creating reward vault');

    const ataRewardVaultKey = getATAKey(vaultKey, rewardMint);
    const ix = await program.instruction.createRewardVault({
      accounts: {
        authority: wallet.publicKey,
        pool: poolKey,
        vault: vaultKey,

        ataRewardVault: ataRewardVaultKey,
        mintReward: rewardMint,

        ...defaultPrograms,
      },
    });
    transaction.add(ix);
  }
  console.log('depositing collateral to ratio');

  const ix = program.instruction.depositCollateral(new anchor.BN(amount), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      pool: poolKey,
      vault: vaultKey,
      userState: userStateKey,
      ataCollatVault: vaultATAKey,
      ataCollatUser: userTokenATA,
      mintCollat: mintCollat,
      oracleA: oracleAKey,
      oracleB: oracleBKey,
      swapTokenA,
      swapTokenB,
      ...defaultPrograms,
    },
  });

  transaction.add(ix);

  if (!needTx) {
    const tx = await sendTransaction(connection, wallet, transaction);
    console.log('tx id->', tx);

    // return 'User deposited ' + amount / Math.pow(10, 6) + ' SOL, transaction id = ' + tx;
  } else {
    return transaction;
  }
}

export async function repayUSDr(connection: Connection, wallet: any, amount: number, mintColl: PublicKey) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintColl);
  const usdrMint = getUSDrMintKey();

  const vaultKey = getVaultPDA(wallet.publicKey, mintColl);
  const userStateKey = getUserStatePDA(wallet.publicKey);

  const ataUserUSDr = getATAKey(wallet.publicKey, usdrMint);

  const transaction = new Transaction();
  const ix = await program.instruction.repayUsdr(new anchor.BN(amount), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      pool: poolKey,
      vault: vaultKey, // TODO: vault -> vault
      userState: userStateKey,
      mintUsdr: usdrMint,
      ataUsdr: ataUserUSDr,
      ...defaultPrograms,
    },
  });
  transaction.add(ix);

  const txHash = await sendTransaction(connection, wallet, transaction, []);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log(`User repaid ${amount / Math.pow(10, DECIMALS_USDT)} USD , transaction id = ${txHash}`);

  return txHash;
}

export async function withdrawCollateral(
  connection: Connection,
  wallet: any,
  amount: number,
  mintCollat: PublicKey,
  needTx = false
) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintCollat);

  const poolData = await program.account.pool.fetch(poolKey);

  const oracleMintA = poolData.swapMintA;
  const oracleMintB = poolData.swapMintB;

  const swapTokenA = poolData.swapTokenA;
  const swapTokenB = poolData.swapTokenB;

  const oracleAKey = getOraclePDA(oracleMintA);
  const oracleBKey = getOraclePDA(oracleMintB);

  const vaultKey = getVaultPDA(wallet.publicKey, mintCollat);
  const vaultATAKey = getATAKey(vaultKey, mintCollat);

  const userStateKey = getUserStatePDA(wallet.publicKey);

  const ataColl = getATAKey(wallet.publicKey, mintCollat);

  const transaction = new Transaction();
  try {
    await connection.getAccountInfo(ataColl);
  } catch {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(mintCollat),
        ataColl,
        wallet.publicKey,
        wallet.publicKey
      )
    );
  }
  const depositInstruction = await program.instruction.withdrawCollateral(new anchor.BN(amount), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      pool: poolKey,
      vault: vaultKey,
      userState: userStateKey,
      ataCollatVault: vaultATAKey,
      ataCollatUser: ataColl,
      mintCollat,

      oracleA: oracleAKey,
      oracleB: oracleBKey,
      swapTokenA,
      swapTokenB,

      ...defaultPrograms,
    },
  });

  transaction.add(depositInstruction);
  if (!needTx) {
    const tx = await sendTransaction(connection, wallet, transaction);
    console.log('tx id->', tx);
    // return 'User withdrawed ' + amount / Math.pow(10, 6) + ' SOL, transaction id = ' + tx;
  }
  return transaction;
}

export async function distributeReward(connection: Connection, wallet: any, mintColl: PublicKey, needTx = false) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintColl);

  const stateInfo = await program.account.globalState.fetch(globalStateKey);
  const poolInfo = await program.account.pool.fetch(poolKey);

  const vaultKey = getVaultPDA(wallet.publicKey, mintColl);
  const ataVaultReward = getATAKey(vaultKey, poolInfo.mintReward);

  const ataUserReward = getATAKey(wallet.publicKey, poolInfo.mintReward);
  const ataRatioReward = getATAKey(stateInfo.treasury, poolInfo.mintReward);

  const transaction = new Transaction();
  try {
    await connection.getAccountInfo(ataUserReward);
  } catch {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(poolInfo.mintReward),
        ataUserReward,
        wallet.publicKey,
        wallet.publicKey
      )
    );
  }
  try {
    await connection.getAccountInfo(ataRatioReward);
  } catch {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(poolInfo.mintReward),
        ataRatioReward,
        stateInfo.treasury,
        wallet.publicKey
      )
    );
  }

  const ix = await program.instruction.distributeReward({
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      pool: poolKey,
      vault: vaultKey,
      ataRewardVault: ataVaultReward,
      ataRewardUser: ataUserReward,
      ataRatioTreasury: ataRatioReward,
      mintReward: poolInfo.mintReward,
      ...defaultPrograms,
    },
  });

  transaction.add(ix);
  if (!needTx) {
    const tx = await sendTransaction(connection, wallet, transaction);
    console.log('tx id->', tx);
    // return 'User withdrawed ' + amount / Math.pow(10, 6) + ' SOL, transaction id = ' + tx;
  }
  return transaction;
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

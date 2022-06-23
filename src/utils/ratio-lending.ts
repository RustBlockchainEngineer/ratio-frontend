/* eslint-disable prettier/prettier */
import { IDL } from './ratio-lending-idl';

import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { sendTransaction } from './rf-web3';
import { RATIO_LENDING_PROGRAM_ID } from '../constants/ids';
import { calculateSaberReward, getQuarryInfo } from './PoolInfoProvider/saber/saber-utils';
import { getATAKey, getGlobalStatePDA, getOraclePDA, getPoolPDA, getUserStatePDA, getVaultPDA } from './ratio-pda';
import { BN, Program } from '@project-serum/anchor';
import { TokenAmount } from './safe-math';
export const COLL_RATIOS_DECIMALS = 8;
export const COLL_RATIOS_ARR_SIZE = 10;

export const RATIO_MINT_DECIMALS = 6;
export const RATIO_MINT_KEY = 'ratioMVg27rSZbSvBopUvsdrGUzeALUfFma61mpxc8J';
export const USDR_MINT_DECIMALS = 6;
export const USDR_MINT_KEY = 'USDrbBQwQbQ2oWHUPfA8QBHcyVxKUq1xHyXsSLKdUq2';
export const USDR_MINT_KEYPAIR = [
  251, 13, 59, 235, 78, 236, 123, 64, 175, 12, 131, 201, 144, 193, 154, 173, 223, 234, 42, 241, 204, 119, 249, 83, 15,
  47, 6, 121, 184, 68, 85, 163, 7, 7, 51, 53, 239, 27, 86, 29, 79, 32, 112, 12, 85, 30, 202, 238, 51, 40, 170, 112, 17,
  54, 255, 88, 82, 72, 138, 64, 134, 44, 240, 141,
];

export const DEPOSIT_ACTION = 'Deposit';
export const WIHTDRAW_ACTION = 'Withdraw';
export const BORROW_ACTION = 'Borrow';
export const PAYBACK_ACTION = 'Payback';
export const HARVEST_ACTION = 'Harvest';

//const HISTORY_TO_SHOW = 5;
export const USD_FAIR_PRICE = true;
// default platform values
export declare type PlatformType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const PLATFORM_IDS = {
  RAYDIUM: 0,
  ORCA: 1,
  SABER: 2,
  MERCURIAL: 3,
  UNKNOWN: 4,
};

export const DEFAULT_PROGRAMS = {
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

// This command makes an Lottery
export function getProgramInstance(connection: Connection, wallet: any) {
  // if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions());
  // Read the generated IDL.

  // Address of the deployed program.
  const programId = RATIO_LENDING_PROGRAM_ID;

  // Generate the program client from IDL.
  const program = new Program(IDL, programId, provider);

  return program;
}

export async function getGlobalState(connection: Connection) {
  const program = getProgramInstance(connection, null);
  const globalStateKey = getGlobalStatePDA();
  return await program.account.globalState.fetchNullable(globalStateKey);
}

export async function getAllOracleState(connection: Connection) {
  const program = getProgramInstance(connection, null);
  return await program.account.oracle.all();
}

export async function getUserCount(connection: Connection) {
  const program = getProgramInstance(connection, null);
  const users = await program.account.userState.all();
  return users.length;
}

export async function getUserState(connection: Connection, wallet: any) {
  if (!wallet || !wallet.publicKey) {
    return null;
  }
  const program = getProgramInstance(connection, wallet);

  const userStateKey = getUserStatePDA(wallet.publicKey);
  return await program.account.userState.fetchNullable(userStateKey);
}

export async function getVaultState(connection: Connection, wallet: any, mintCollat: string | PublicKey) {
  if (!wallet || !wallet.publicKey) {
    return null;
  }
  const program = getProgramInstance(connection, wallet);

  const vaultKey = getVaultPDA(wallet.publicKey, new PublicKey(mintCollat));
  return await program.account.vault.fetchNullable(vaultKey);
}

export async function getLendingPoolByMint(connection: Connection, mint: string | PublicKey): Promise<any | undefined> {
  const program = getProgramInstance(connection, null);
  const tokenPoolKey = getPoolPDA(mint);
  return await program.account.pool.fetchNullable(tokenPoolKey);
}

export async function getAllLendingPool(connection: Connection): Promise<any[]> {
  const program = getProgramInstance(connection, null);
  return await program.account.pool.all();
}

export async function depositCollateralTx(connection: Connection, wallet: any, amount: number, mintCollat: PublicKey) {
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

  const mintReward = poolData.mintReward;

  const vaultKey = getVaultPDA(wallet.publicKey, mintCollat);
  const userStateKey = getUserStatePDA(wallet.publicKey);

  const userTokenATA = getATAKey(wallet.publicKey, mintCollat);
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
          ...DEFAULT_PROGRAMS,
        },
      })
    );
  }
  try {
    await program.account.vault.fetch(vaultKey);
  } catch {
    console.log('creating vault');
    const tx = await program.instruction.createVault({
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
        ...DEFAULT_PROGRAMS,
      },
    });
    transaction.add(tx);
    console.log('creating reward vault');

    const ataRewardVaultKey = getATAKey(vaultKey, mintReward);
    const ix = await program.instruction.createRewardVault({
      accounts: {
        authority: wallet.publicKey,
        pool: poolKey,
        vault: vaultKey,

        ataRewardVault: ataRewardVaultKey,
        mintReward: mintReward,

        ...DEFAULT_PROGRAMS,
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
      ...DEFAULT_PROGRAMS,
    },
  });

  transaction.add(ix);

  return transaction;
}

export async function withdrawCollateralTx(connection: Connection, wallet: any, amount: number, mintCollat: PublicKey) {
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
  if (!(await connection.getAccountInfo(ataColl))) {
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

      ...DEFAULT_PROGRAMS,
    },
  });

  transaction.add(depositInstruction);
  return transaction;
}

export async function distributeRewardTx(connection: Connection, wallet: any, mintColl: PublicKey) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintColl);

  const stateInfo = await program.account.globalState.fetch(globalStateKey);
  const poolInfo = await program.account.pool.fetch(poolKey);

  const vaultKey = getVaultPDA(wallet.publicKey, mintColl);
  const ataVaultReward = getATAKey(vaultKey, poolInfo.mintReward);

  const ataUserReward = getATAKey(wallet.publicKey, poolInfo.mintReward);
  const ataTreasuryReward = getATAKey(stateInfo.treasury, poolInfo.mintReward);

  const transaction = new Transaction();
  if (!(await connection.getAccountInfo(ataUserReward))) {
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
  if (!(await connection.getAccountInfo(ataTreasuryReward))) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(poolInfo.mintReward),
        ataTreasuryReward,
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
      ataRatioTreasury: ataTreasuryReward,
      ...DEFAULT_PROGRAMS,
    },
  });

  transaction.add(ix);
  return transaction;
}

export async function harvestRatioReward(
  connection: Connection,
  wallet: any,
  mintColl: PublicKey | string,
  needTx = false
) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  console.log('Harvesting ratio token');

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintColl);

  const stateInfo = await program.account.globalState.fetch(globalStateKey);

  const vaultKey = getVaultPDA(wallet.publicKey, mintColl);

  const ataGlobalRatio = getATAKey(globalStateKey, stateInfo.ratioMint);
  const ataUserRatio = getATAKey(wallet.publicKey, stateInfo.ratioMint);
  const ataRatioTreasury = getATAKey(stateInfo.treasury, stateInfo.ratioMint);
  const transaction = new Transaction();

  if (!(await connection.getAccountInfo(ataUserRatio))) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        stateInfo.ratioMint,
        ataUserRatio,
        wallet.publicKey,
        wallet.publicKey
      )
    );
  }
  if (!(await connection.getAccountInfo(ataRatioTreasury))) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(stateInfo.ratioMint),
        ataRatioTreasury,
        stateInfo.treasury,
        wallet.publicKey
      )
    );
  }

  const ix = await program.instruction.harvestRatio({
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      pool: poolKey,
      vault: vaultKey,
      ratioVault: ataGlobalRatio,
      ataRewardUser: ataUserRatio,
      ataRatioTreasury: ataRatioTreasury,
      ...DEFAULT_PROGRAMS,
    },
  });

  transaction.add(ix);
  if (needTx) {
    return transaction;
  } else {
    const txHash = await sendTransaction(connection, wallet, transaction);

    if (txHash?.value?.err) {
      console.error('ERROR ON TX ', txHash.value.err);
      throw txHash.value.err;
    }

    return txHash.toString();
  }
}

export async function borrowUSDr(connection: Connection, wallet: any, amount: number, mintCollat: PublicKey) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const usdrMint = new PublicKey(USDR_MINT_KEY);
  const poolKey = getPoolPDA(mintCollat);

  const stateInfo = await program.account.globalState.fetch(globalStateKey);
  const treasuryKey = stateInfo.treasury;

  const poolData = await program.account.pool.fetch(poolKey);

  const oracleMintA = poolData.swapMintA;
  const oracleMintB = poolData.swapMintB;
  const oracleAKey = getOraclePDA(oracleMintA);
  const oracleBKey = getOraclePDA(oracleMintB);

  const swapTokenA = poolData.swapTokenA;
  const swapTokenB = poolData.swapTokenB;

  const ataUSDr = getATAKey(wallet.publicKey, usdrMint);
  const ataUSDrTreasury = getATAKey(treasuryKey, usdrMint);

  const vaultKey = getVaultPDA(wallet.publicKey, mintCollat);
  const userStateKey = getUserStatePDA(wallet.publicKey);

  const transaction = new Transaction();

  if (!(await connection.getAccountInfo(ataUSDr))) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        usdrMint,
        ataUSDr,
        wallet.publicKey,
        wallet.publicKey
      )
    );
  }

  if (!(await connection.getAccountInfo(ataUSDrTreasury))) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        usdrMint,
        ataUSDrTreasury,
        treasuryKey,
        wallet.publicKey
      )
    );
  }

  const borrowInstruction = await program.instruction.borrowUsdr(new anchor.BN(amount), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      treasury: treasuryKey,
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
      ataUsdrTreasury: ataUSDrTreasury,
      ...DEFAULT_PROGRAMS,
    },
  });

  transaction.add(borrowInstruction);

  const txHash = await sendTransaction(connection, wallet, transaction);

  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log(`User borrowed ${amount / Math.pow(10, USDR_MINT_DECIMALS)} USD , transaction id = ${txHash}`);

  return txHash.toString();
}

export async function repayUSDr(connection: Connection, wallet: any, amount: number, mintColl: PublicKey) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintColl);
  const usdrMint = USDR_MINT_KEY;

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
      ...DEFAULT_PROGRAMS,
    },
  });
  transaction.add(ix);

  const txHash = await sendTransaction(connection, wallet, transaction, []);

  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log(`User repaid ${amount / Math.pow(10, USDR_MINT_DECIMALS)} USD , txId = ${txHash}`);

  return txHash;
}

export async function calculateRewardByPlatform(
  connection: Connection,
  wallet: any,
  mintCollKey: string | PublicKey,
  platformType: number
) {
  let reward = 0;
  if (platformType === PLATFORM_IDS.SABER) {
    reward = await calculateSaberReward(connection, wallet, new PublicKey(mintCollKey));
  }

  return parseFloat(reward.toFixed(USDR_MINT_DECIMALS));
}

export async function getFarmInfoByPlatform(
  connection: Connection,
  mintCollKey: string | PublicKey,
  platformType: number
) {
  if (platformType === PLATFORM_IDS.SABER) {
    return await getQuarryInfo(connection, new PublicKey(mintCollKey));
  }
}

const ACC_PRECISION = new BN(100 * 1000 * 1000 * 1000);
export function estimateRatioRewards(poolData: any, vaultData: any) {
  const currentTimeStamp = Math.ceil(new Date().getTime() / 1000);

  const duration = new BN(Math.max(currentTimeStamp - poolData.lastRewardTime, 0));

  const reward_per_share =
    poolData.lastRewardFundEnd > currentTimeStamp
      ? poolData.tokenPerSecond.mul(duration).mul(ACC_PRECISION).div(poolData.totalColl)
      : new BN(0);
  const acc_reward_per_share = poolData.accRewardPerShare.add(reward_per_share);

  const pending_amount = vaultData.totalColl
    .mul(acc_reward_per_share)
    .div(ACC_PRECISION)
    .sub(vaultData.ratioRewardDebt);
  const total_reward = vaultData.ratioRewardAmount.add(pending_amount);

  return total_reward.toString();
}

export function estimateRATIOAPY(poolData: any, ratio_price: number) {
  const annual_reward_amount =
    Number(new TokenAmount(poolData.tokenPerSecond, RATIO_MINT_DECIMALS).fixed()) * 365 * 24 * 3600;
  const annual_reward_value = annual_reward_amount * ratio_price;
  const tvl = +new TokenAmount(poolData.tvlUsd.toString(), USDR_MINT_DECIMALS, true).fixed();

  const apr = annual_reward_value / tvl;
  const apy = Number(((1 + apr / 365) ** 365 - 1) * 100);
  return apy;
}

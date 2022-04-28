import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { WalletAdapter } from '../contexts/wallet';
import * as anchor from '@project-serum/anchor';
import {
  getGlobalState,
  getProgramInstance,
  defaultPrograms,
  GLOBAL_TVL_LIMIT,
  GLOBAL_DEBT_CEILING,
  USER_DEBT_CEILING,
  POOL_DEBT_CEILING,
  PlatformType,
  ORACLE_REPORTER,
} from './ratio-lending';
import { CollateralizationRatios, EmergencyState } from '../types/admin-types';
import BN from 'bn.js';
// import { createSaberTokenVault } from './saber/saber-utils';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { sendTransaction } from './web3';
import {
  COLL_RATIOS_DECIMALS,
  GLOBAL_DEBT_CEILING_DECIMALS,
  TVL_DECIMAL,
  USER_DEBT_CEILING_DECIMALS,
} from '../constants';
import { getGlobalStatePDA, getOraclePDA, getPoolPDA, getPoolPDAWithBump, getUSDrMintKey } from './ratio-pda';
import { DECIMALS_PRICE } from './constants';
// import RiskLevel from '../components/Dashboard/RiskLevel';
// import { PLATFORM_TYPE_SABER } from './constants';

export const ADMIN_SETTINGS_DECIMALS = 6;

export async function setEmergencyState(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  newState: EmergencyState
) {
  await toggleEmergencyState(connection, wallet, newState as number);
}

export async function toggleEmergencyState(connection: Connection, wallet: any, paused: number) {
  try {
    if (!wallet.publicKey) throw new WalletNotConnectedError();
    const program = getProgramInstance(connection, wallet);
    const globalStateKey = await getGlobalStatePDA();
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.toggleEmerState(paused, {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log('------ SET EMERGENCY STATE TX --------');
    console.log(tx);
    const txResult = await connection.confirmTransaction(tx);
    if (txResult.value.err) {
      throw txResult.value.err;
    }
  } catch (error) {
    console.error('ERROR when changing the emergency state.', error);
    throw error;
  }
}

// createGlobalState
export async function createGlobalState(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = getGlobalStatePDA();
  console.log('globalStateKey', globalStateKey.toBase58());
  const mintUsdKey = getUSDrMintKey();
  console.log('mintUsdKey', mintUsdKey.toBase58());
  try {
    const globalState = await program.account.globalState.fetch(globalStateKey);
    console.log('already created');
    console.log('globalState', globalState);
    return 'already created';
  } catch (e) {
    console.log("Global state didn't exist");
  }
  try {
    await program.rpc.createGlobalState(
      new anchor.BN(GLOBAL_TVL_LIMIT),
      new anchor.BN(GLOBAL_DEBT_CEILING),
      new anchor.BN(USER_DEBT_CEILING),
      ORACLE_REPORTER,
      {
        accounts: {
          authority: wallet.publicKey,
          globalState: globalStateKey,
          mintUsdr: mintUsdKey,
          ...defaultPrograms,
        },
      }
    );
  } catch (e) {
    console.log("can't create global state");
    console.error(e);
  }
  return 'created global state';
}

export async function createPriceOracle(
  connection,
  wallet,

  mint: PublicKey,
  initPrice: number
) {
  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const oracleKey = getOraclePDA(mint);

  const tx = program.transaction.createOracle(
    // price of token
    new BN(initPrice * 10 ** DECIMALS_PRICE),
    {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        oracle: oracleKey,
        mint, // the mint account that represents the token this oracle reports for
        // system accts
        ...defaultPrograms,
      },
    }
  );

  const txHash = await sendTransaction(connection, wallet, tx);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log('Created Oracle account  tx = ', txHash);

  return txHash;
}

export async function reportPriceOracle(
  connection,
  wallet,

  mint: PublicKey,
  newPrice: number
) {
  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const oracleKey = getOraclePDA(mint);

  const tx = program.transaction.reportPriceToOracle(
    // price of token
    new BN(newPrice * DECIMALS_PRICE),
    {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        oracle: oracleKey,
        mint: mint,
        ...defaultPrograms,
      },
    }
  );

  const txHash = await sendTransaction(connection, wallet, tx);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log('Updated price of Oracle account  tx = ', txHash);

  return txHash;
}

// createPool
export async function createPool(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey,
  riskLevel: number,
  platformType: PlatformType,

  mintReward: string | PublicKey,
  oracleMintA: string | PublicKey,
  oracleMintB: string | PublicKey,
  swapTokenA: string | PublicKey,
  swapTokenB: string | PublicKey
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);

  const [poolKey, poolBump] = getPoolPDAWithBump(mintCollKey);

  const globalStateKey = getGlobalStatePDA();

  try {
    const pool = await program.account.pool.fetch(poolKey);
    console.log('already created');
    console.log('pool', pool);
    return 'already created';
  } catch (e) {
    console.log("pool didn't exist");
  }

  const transaction = new Transaction();
  const oracleAKey = getOraclePDA(oracleMintA);
  const oracleBKey = getOraclePDA(oracleMintB);

  try {
    await program.account.oracle.fetch(oracleAKey);
  } catch {
    transaction.add(
      program.instruction.createOracle(
        // price of token
        new BN(10 ** DECIMALS_PRICE),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleAKey,
            mint: oracleMintA, // the mint account that represents the token this oracle reports for
            // system accts
            ...defaultPrograms,
          },
        }
      )
    );
  }

  try {
    await program.account.oracle.fetch(oracleBKey);
  } catch {
    transaction.add(
      program.instruction.createOracle(
        // price of token
        new BN(10 ** DECIMALS_PRICE),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleBKey,
            mint: oracleMintB, // the mint account that represents the token this oracle reports for
            // system accts
            ...defaultPrograms,
          },
        }
      )
    );
  }
  transaction.add(
    program.instruction.createPool(poolBump, new BN(riskLevel), new BN(POOL_DEBT_CEILING), platformType, {
      accounts: {
        authority: wallet.publicKey,
        pool: poolKey,
        globalState: globalStateKey,
        mintCollat: mintCollKey,
        swapTokenA,
        swapTokenB,
        mintReward,
        ...defaultPrograms,
      },
    })
  );
  const tx = await sendTransaction(connection, wallet, transaction);
  return tx;
}

export async function getCurrentEmergencyState(
  connection: Connection,
  wallet: WalletAdapter | undefined
): Promise<EmergencyState> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.paused as EmergencyState;
  } catch (e) {
    console.error('Error while fetching the emergency state');
    throw e;
  }
}
export async function changeSuperOwner(connection: Connection, wallet: WalletAdapter | undefined, newOwner: PublicKey) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();
  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.changeAuthority(newOwner, {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log('------ CHANGE AUTHORITY TX --------');
    console.log(tx);
    const txResult = await connection.confirmTransaction(tx);
    if (txResult.value.err) {
      throw txResult.value.err;
    }
  } catch (error) {
    console.error('ERROR when changing the authority.', error);
    throw error;
  }
}

export async function setGlobalTvlLimit(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  newTvlLimit: number
) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();
  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setGlobalTvlLimit(new anchor.BN(newTvlLimit * 10 ** TVL_DECIMAL), {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log('------ TX GLOBAL TVL LIMIT --------');
    console.log('tx id->', tx);
    const txResult = await connection.confirmTransaction(tx);
    if (txResult.value.err) {
      throw txResult.value.err;
    }
  } catch (error) {
    console.log('There was an error while setting the global tvl limit', error);
    throw error;
  }
}

export async function getGlobalTVLLimit(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.tvlCollatCeilingUsd.toNumber() / 10 ** DECIMALS_PRICE;
  } catch (e) {
    console.error('Error while fetching the tvl limiy');
    throw e;
  }
}

export async function getGlobalDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.debtCeilingGlobal.toNumber() / 10 ** DECIMALS_PRICE;
  } catch (e) {
    console.error('Error while fetching the global debt ceiling');
    throw e;
  }
}

export async function getUserDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.debtCeilingUser.toNumber() / 10 ** DECIMALS_PRICE;
  } catch (e) {
    console.error('Error while fetching the global user debt ceiling');
    throw e;
  }
}

export async function setGlobalDebtCeiling(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  newDebtCeiling: number
): Promise<boolean> {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();

  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setGlobalDebtCeiling(
      new anchor.BN(newDebtCeiling * 10 ** GLOBAL_DEBT_CEILING_DECIMALS),
      {
        accounts: {
          authority: wallet.publicKey,
          globalState: globalStateKey,
        },
      }
    );
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log('----- TX GLOBAL DEBT CEILING ------');
    console.log(tx);
    const txResult = await connection.confirmTransaction(tx);
    if (txResult.value.err) {
      throw txResult.value.err;
    }
    return true;
  } catch (error) {
    console.log('There was an error while setting the global debt ceiling', error);
    throw error;
  }
}

export async function setPoolDebtCeiling(
  connection: Connection,
  wallet: any,
  vaultDebtCeiling: number,
  mintCollKey: PublicKey
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();
  const poolKey = await getPoolPDA(mintCollKey);
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.setPoolDebtCeiling(new anchor.BN(vaultDebtCeiling * 10 ** DECIMALS_PRICE), {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      pool: poolKey,
    },
  });
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  const txResult = await connection.confirmTransaction(tx);
  if (txResult.value.err) {
    throw txResult.value.err;
  }
  console.log('tx id->', tx);
  return 'Set Vault Debt Ceiling to' + vaultDebtCeiling + ', transaction id = ' + tx;
}

export async function setUserDebtCeiling(connection: Connection, wallet: any, newDebtCeiling: number) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  try {
    const program = getProgramInstance(connection, wallet);
    const globalStateKey = await getGlobalStatePDA();
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setUserDebtCeiling(
      new anchor.BN(newDebtCeiling * 10 ** USER_DEBT_CEILING_DECIMALS),
      {
        accounts: {
          authority: wallet.publicKey,
          globalState: globalStateKey,
        },
      }
    );
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log('tx id->', tx);
    const txResult = await connection.confirmTransaction(tx);
    if (txResult.value.err) {
      throw txResult.value.err;
    }
  } catch (error) {
    console.log('There was an error while setting the user debt  ceiling', error);
    throw error;
  }
}

export async function getCollateralRatio(
  connection: Connection,
  wallet: WalletAdapter | undefined
): Promise<CollateralizationRatios> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    const readValues = globalState.collPerRisklv.map((risk) => risk.toNumber());
    const result: CollateralizationRatios = {
      cr_aaa_ratio: readValues[0] / 10 ** COLL_RATIOS_DECIMALS,
      cr_aa_ratio: readValues[1] / 10 ** COLL_RATIOS_DECIMALS,
      cr_a_ratio: readValues[2] / 10 ** COLL_RATIOS_DECIMALS,
      cr_bbb_ratio: readValues[3] / 10 ** COLL_RATIOS_DECIMALS,
      cr_bb_ratio: readValues[4] / 10 ** COLL_RATIOS_DECIMALS,
      cr_b_ratio: readValues[5] / 10 ** COLL_RATIOS_DECIMALS,
      cr_ccc_ratio: readValues[6] / 10 ** COLL_RATIOS_DECIMALS,
      cr_cc_ratio: readValues[7] / 10 ** COLL_RATIOS_DECIMALS,
      cr_c_ratio: readValues[8] / 10 ** COLL_RATIOS_DECIMALS,
      cr_d_ratio: readValues[9] / 10 ** COLL_RATIOS_DECIMALS,
    };
    return result;
  } catch (e) {
    console.error('Error while fetching the collateral ratios');
    throw e;
  }
}

export async function setCollateralRatio(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connection: Connection,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wallet: WalletAdapter | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  values: CollateralizationRatios
): Promise<boolean> {
  // const program = await getProgramInstance(connection, wallet);
  // const globalStateKey = await getGlobalStatePDA();

  // const bigNumberValues = Object.values(values)?.map((value: string) => {
  //   return new BN(parseFloat(value) * 10 ** COLL_RATIOS_DECIMALS);
  // });
  // console.log('BIG NUMBER VALUES');
  // console.log(bigNumberValues);
  // try {
  //   const tx = await program.rpc.setCollaterialRatio(bigNumberValues, {
  //     accounts: {
  //       authority: wallet?.publicKey,
  //       globalState: globalStateKey,
  //     },
  //   });
  //   console.log('----- TX COLLATERAL RATIO ------');
  //   console.log(tx);
  //   return true;
  // } catch (error) {
  //   console.log('ERROR');
  //   console.log(error);
  //   throw error;
  // }
  return true;
}

export async function getHarvestFee(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return (globalState.feeNum.toNumber() / globalState.feeDeno.toNumber()) * 100;
  } catch (e) {
    console.error('Error while fetching the harvest fee');
    throw e;
  }
}

export async function setHarvestFee(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  feeNum: number
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalState, globalStateKey } = await getGlobalState(connection, wallet);

  const feeDeno = globalState.feeDeno.toNumber();
  const feeNumNew = (feeNum / 100) * feeDeno;
  console.log(`Set Harvest fees ${feeNumNew} / ${feeDeno}`);
  try {
    const tx = await program.rpc.setHarvestFee(new BN(feeNumNew), new BN(feeDeno), {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
    console.log('----- TX HARVEST FEE ------');
    console.log(tx);
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
  }
  return true;
}
// eslint-disable-next-line
export async function setBorrowFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setBorrowFee yet not implemented');
}
// eslint-disable-next-line
export async function setPaybackFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setPaybackFee yet not implemented');
}
// eslint-disable-next-line
export async function setStakeFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setStakeFee yet not implemented');
}
// eslint-disable-next-line
export async function setSwapFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setSwapFee yet not implemented');
}
// eslint-disable-next-line
export async function setWithdrawFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setWithdrawFee yet not implemented');
}
// eslint-disable-next-line
export async function setDepositFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setDepositFee yet not implemented');
}

export async function changeTreasury(connection: Connection, wallet: any, newTreasury: PublicKey) {
  if (!wallet?.publicKey) throw new WalletNotConnectedError();

  try {
    const program = getProgramInstance(connection, wallet);
    const globalStateKey = await getGlobalStatePDA();
    const transaction = new Transaction();
    const ix = await program.instruction.changeTreasuryWallet(newTreasury, {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        treasury: newTreasury,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction);
    console.log('tx id->', tx);
    const txResult = await connection.confirmTransaction(tx);
    if (txResult?.value?.err) {
      throw txResult.value.err;
    }
    return 'Set Treasury to' + newTreasury.toBase58() + ', transaction id = ' + tx;
  } catch (e) {
    console.error('Error while setting the treasury wallet', e);
    throw e;
  }
}

export async function getCurrentTreasuryWallet(connection: Connection, wallet: any): Promise<PublicKey> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.treasury;
  } catch (e) {
    console.error('Error while fetching the treasury wallet');
    throw e;
  }
}

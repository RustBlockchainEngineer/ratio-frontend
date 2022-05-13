import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { WalletAdapter } from '../contexts/wallet';
import * as anchor from '@project-serum/anchor';
import {
  getGlobalState,
  getProgramInstance,
  DEFAULT_PROGRAMS,
  GLOBAL_TVL_LIMIT,
  GLOBAL_DEBT_CEILING,
  USER_DEBT_CEILING,
  POOL_DEBT_CEILING,
  PlatformType,
  COLL_RATIOS_DECIMALS,
  COLL_RATIOS_ARR_SIZE,
  USDR_MINT_KEYPAIR,
} from './ratio-lending';
import { CollateralizationRatios, EmergencyState } from '../types/admin-types';
import BN from 'bn.js';
// import { createSaberTokenVault } from './saber/saber-utils';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { sendTransaction } from './web3';

import { getGlobalStatePDA, getOraclePDA, getPoolPDA } from './ratio-pda';
import { USDR_MINT_DECIMALS, USDR_MINT_KEY } from './ratio-lending';

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
    // const ix = await program.instruction.toggleEmerState(paused, {
    //   accounts: {
    //     authority: wallet.publicKey,
    //     globalState: globalStateKey,
    //   },
    // });
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
  const globalState = await program.account.globalState.fetchNullable(globalStateKey);
  if (globalState) {
    console.log('GlobalState exists');
    return 'GlobalState exists';
  }
  try {
    await program.rpc.createGlobalState(
      new anchor.BN(GLOBAL_TVL_LIMIT),
      new anchor.BN(GLOBAL_DEBT_CEILING),
      new anchor.BN(USER_DEBT_CEILING),
      wallet.publicKey,
      {
        accounts: {
          authority: wallet.publicKey,
          globalState: globalStateKey,
          mintUsdr: USDR_MINT_KEY,
          ...DEFAULT_PROGRAMS,
        },
        signers: [Keypair.fromSecretKey(new Uint8Array(USDR_MINT_KEYPAIR))],
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
  initPrice = 1
) {
  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const oracleKey = getOraclePDA(mint);

  const tx = program.transaction.createOracle(
    // price of token
    new BN(initPrice * 10 ** USDR_MINT_DECIMALS),
    {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        oracle: oracleKey,
        mint, // the mint account that represents the token this oracle reports for
        // system accts
        ...DEFAULT_PROGRAMS,
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

export async function getPriceOracle(
  connection,
  wallet,

  mint: PublicKey
) {
  const program = getProgramInstance(connection, wallet);

  const oracleKey = getOraclePDA(mint);

  const oracle = await program.account.oracle.fetchNullable(oracleKey);

  return oracle;
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
    new BN(newPrice * USDR_MINT_DECIMALS),
    {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        oracle: oracleKey,
        mint: mint,
        ...DEFAULT_PROGRAMS,
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
  mintCollKey: string | PublicKey,
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

  const poolKey = getPoolPDA(mintCollKey);

  const globalStateKey = getGlobalStatePDA();

  const transaction = new Transaction();
  const oracleAKey = getOraclePDA(oracleMintA);
  const oracleBKey = getOraclePDA(oracleMintB);

  try {
    await program.account.oracle.fetch(oracleAKey);
  } catch {
    transaction.add(
      program.instruction.createOracle(
        // price of token
        new BN(10 ** USDR_MINT_DECIMALS),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleAKey,
            mint: oracleMintA, // the mint account that represents the token this oracle reports for
            // system accts
            ...DEFAULT_PROGRAMS,
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
        new BN(10 ** USDR_MINT_DECIMALS),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleBKey,
            mint: oracleMintB, // the mint account that represents the token this oracle reports for
            // system accts
            ...DEFAULT_PROGRAMS,
          },
        }
      )
    );
  }
  transaction.add(
    program.instruction.createPool(riskLevel, new BN(POOL_DEBT_CEILING), platformType, {
      accounts: {
        authority: wallet.publicKey,
        pool: poolKey,
        globalState: globalStateKey,
        mintCollat: mintCollKey,
        swapTokenA,
        swapTokenB,
        mintReward,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  const tx = await sendTransaction(connection, wallet, transaction);
  await connection.confirmTransaction(tx);
  return tx;
}

export async function updatePool(
  connection: Connection,
  wallet: any,
  mintCollKey: string | PublicKey,
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

  const poolKey = getPoolPDA(mintCollKey);

  const globalStateKey = getGlobalStatePDA();

  const transaction = new Transaction();
  const oracleAKey = getOraclePDA(oracleMintA);
  const oracleBKey = getOraclePDA(oracleMintB);

  try {
    await program.account.oracle.fetch(oracleAKey);
  } catch {
    transaction.add(
      program.instruction.createOracle(
        // price of token
        new BN(10 ** USDR_MINT_DECIMALS),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleAKey,
            mint: oracleMintA, // the mint account that represents the token this oracle reports for
            // system accts
            ...DEFAULT_PROGRAMS,
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
        new BN(10 ** USDR_MINT_DECIMALS),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleBKey,
            mint: oracleMintB, // the mint account that represents the token this oracle reports for
            // system accts
            ...DEFAULT_PROGRAMS,
          },
        }
      )
    );
  }
  transaction.add(
    program.instruction.updatePool(riskLevel, platformType, {
      accounts: {
        authority: wallet.publicKey,
        pool: poolKey,
        globalState: globalStateKey,
        swapTokenA,
        swapTokenB,
        mintReward,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  const tx = await sendTransaction(connection, wallet, transaction);
  await connection.confirmTransaction(tx);
  return tx;
}

// getPool
export async function getPool(connection: Connection, wallet: any, poolKey: PublicKey) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);

  const pool = await program.account.pool.fetchNullable(poolKey);
  return pool;
}

// getPool
export async function getAllPools(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);

  const all = await program.account.pool.all();
  return all;
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
    const ix = await program.instruction.setGlobalTvlLimit(new anchor.BN(newTvlLimit * 10 ** USDR_MINT_DECIMALS), {
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
      new anchor.BN(newDebtCeiling * 10 ** USDR_MINT_DECIMALS),
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
  const ix = await program.instruction.setPoolDebtCeiling(new anchor.BN(vaultDebtCeiling * 10 ** USDR_MINT_DECIMALS), {
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

export async function setPoolPaused(connection: Connection, wallet: any, poolKey: PublicKey, value: number) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  console.log('wallet', wallet);
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = getGlobalStatePDA();

  const tx = await program.rpc.setPoolPaused(value, {
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      pool: poolKey,
    },
  });
  console.log('tx id->', tx);
  const txResult = await connection.confirmTransaction(tx);
  if (txResult.value.err) {
    throw txResult.value.err;
  }
  return 'Set Vault paused status to' + (value === 0 ? 'false' : 'true') + ', transaction id = ' + tx;
}

export async function setUserDebtCeiling(connection: Connection, wallet: any, newDebtCeiling: number) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  try {
    const program = getProgramInstance(connection, wallet);
    const globalStateKey = await getGlobalStatePDA();
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setUserDebtCeiling(new anchor.BN(newDebtCeiling * 10 ** USDR_MINT_DECIMALS), {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
      },
    });
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

export async function setCollateralRatio(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connection: Connection,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wallet: WalletAdapter | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  values: CollateralizationRatios
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();

  const bigNumberValues = Object.values(values)
    ?.map((value: string) => {
      return new BN(parseFloat(value) * 10 ** COLL_RATIOS_DECIMALS);
    })
    .slice(0, COLL_RATIOS_ARR_SIZE);
  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setCollateralRatios(bigNumberValues, {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log(tx);
    return true;
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
  }
}

export async function setHarvestFee(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  feeNum: number
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = getGlobalStatePDA();
  const globalState = await getGlobalState(connection, wallet);

  const feeDeno = globalState.feeDeno.toNumber();
  const feeNumNew = (feeNum / 100) * feeDeno;
  console.log(`Set Harvest fees ${feeNumNew} / ${feeDeno}`);
  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setHarvestFee(new BN(feeNumNew), {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
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
    const ix = await program.instruction.changeTreasuryWallet({
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

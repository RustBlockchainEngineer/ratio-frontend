import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js';
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
  RATIO_MINT_KEY,
  RATIO_MINT_DECIMALS,
} from './ratio-lending';
import { CollateralizationRatios, EmergencyState } from '../types/admin-types';
import BN from 'bn.js';
import { sendTransaction } from './rf-web3';

import { getATAKey, getGlobalStatePDA, getOraclePDA, getPoolPDA } from './ratio-pda';
import { USDR_MINT_DECIMALS, USDR_MINT_KEY } from './ratio-lending';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export async function setEmergencyState(connection: Connection, wallet: any, newState: EmergencyState) {
  await toggleEmergencyState(connection, wallet, newState as number);
}

async function toggleEmergencyState(connection: Connection, wallet: any, paused: number) {
  try {
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
          ratioMint: RATIO_MINT_KEY,
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
  connection: Connection,
  wallet: any,

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
  connection: Connection,
  wallet: any,

  mint: PublicKey
) {
  const program = getProgramInstance(connection, wallet);

  const oracleKey = getOraclePDA(mint);

  const oracle = await program.account.oracle.fetchNullable(oracleKey);

  return oracle;
}
export async function reportPriceOracle(
  connection: Connection,
  wallet: any,

  mint: PublicKey,
  newPrice: number
) {
  const program = getProgramInstance(connection, wallet);

  const globalStateKey = getGlobalStatePDA();
  const oracleKey = getOraclePDA(mint);

  const tx = program.transaction.reportPriceToOracle(
    // price of token
    new BN(newPrice * 10 ** USDR_MINT_DECIMALS),
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
  // await connection.confirmTransaction(txHash);
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

  mintReward: string | PublicKey | undefined
) {
  const program = getProgramInstance(connection, wallet);

  const poolKey = getPoolPDA(mintCollKey);

  const globalStateKey = getGlobalStatePDA();

  const transaction = new Transaction();
  const oracleKey = getOraclePDA(mintCollKey);
  const tmpATACollReserve = getATAKey(globalStateKey, mintCollKey);
  const rewardMintKey = mintReward ? mintReward : mintCollKey;
  try {
    await program.account.oracle.fetch(oracleKey);
  } catch {
    transaction.add(
      program.instruction.createOracle(
        // price of token
        new BN(0),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleKey,
            mint: mintCollKey, // the mint account that represents the token this oracle reports for
            // system accts
            ...DEFAULT_PROGRAMS,
          },
        }
      )
    );
  }

  if (!(await connection.getAccountInfo(tmpATACollReserve))) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(mintCollKey),
        tmpATACollReserve,
        globalStateKey,
        wallet.publicKey
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
        swapTokenA: tmpATACollReserve,
        swapTokenB: tmpATACollReserve,
        mintReward: rewardMintKey,
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

  mintReward: string | PublicKey
) {
  const program = getProgramInstance(connection, wallet);

  const poolKey = getPoolPDA(mintCollKey);

  const globalStateKey = getGlobalStatePDA();

  const transaction = new Transaction();
  const oracleKey = getOraclePDA(mintCollKey);
  const tmpATACollReserve = getATAKey(globalStateKey, mintCollKey);
  const rewardMintKey = mintReward ? mintReward : mintCollKey;
  try {
    await program.account.oracle.fetch(oracleKey);
  } catch {
    transaction.add(
      program.instruction.createOracle(
        // price of token
        new BN(10 ** USDR_MINT_DECIMALS),
        {
          accounts: {
            authority: wallet.publicKey,
            globalState: globalStateKey,
            oracle: oracleKey,
            mint: mintCollKey, // the mint account that represents the token this oracle reports for
            // system accts
            ...DEFAULT_PROGRAMS,
          },
        }
      )
    );
  }
  if (!(await connection.getAccountInfo(tmpATACollReserve))) {
    transaction.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(mintCollKey),
        tmpATACollReserve,
        globalStateKey,
        wallet.publicKey
      )
    );
  }

  transaction.add(
    program.instruction.updatePool(riskLevel, platformType, {
      accounts: {
        authority: wallet.publicKey,
        pool: poolKey,
        globalState: globalStateKey,
        swapTokenA: tmpATACollReserve,
        swapTokenB: tmpATACollReserve,
        mintReward: rewardMintKey,
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
  const program = getProgramInstance(connection, wallet);

  const pool = await program.account.pool.fetchNullable(poolKey);
  return pool;
}

// getPool
export async function getAllPools(connection: Connection, wallet: any) {
  const program = getProgramInstance(connection, wallet);

  const all = await program.account.pool.all();
  return all;
}

export async function changeSuperOwner(connection: Connection, wallet: any, newOwner: PublicKey) {
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

export async function setGlobalTvlLimit(connection: Connection, wallet: any, newTvlLimit: number) {
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
  wallet: any,
  newDebtCeiling: number
): Promise<boolean> {
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
  wallet: any,
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

export async function setHarvestFee(connection: Connection, wallet: any, feeNum: number): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = getGlobalStatePDA();
  const globalState = await getGlobalState(connection);

  const feeDeno = globalState?.feeDeno.toNumber() ?? 0;
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
export async function setBorrowFee(connection: Connection, wallet: any, feeNum: number) {
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = getGlobalStatePDA();
  const globalState = await getGlobalState(connection);

  const feeDeno = globalState?.feeDeno.toNumber() ?? 0;
  const feeNumNew = (feeNum / 100) * feeDeno;
  console.log(`Set Borrow fees ${feeNumNew} / ${feeDeno}`);
  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setBorrowFee(new BN(feeNumNew), {
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
export async function setPaybackFee(connection: Connection, wallet: any, value: number) {
  console.error('setPaybackFee yet not implemented');
}
// eslint-disable-next-line
export async function setStakeFee(connection: Connection, wallet: any, value: number) {
  console.error('setStakeFee yet not implemented');
}
// eslint-disable-next-line
export async function setSwapFee(connection: Connection, wallet: any, value: number) {
  console.error('setSwapFee yet not implemented');
}
// eslint-disable-next-line
export async function setWithdrawFee(connection: Connection, wallet: any, value: number) {
  console.error('setWithdrawFee yet not implemented');
}
// eslint-disable-next-line
export async function setDepositFee(connection: Connection, wallet: any, value: number) {
  console.error('setDepositFee yet not implemented');
}

export async function changeTreasury(connection: Connection, wallet: any, newTreasury: PublicKey) {
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

export async function changeOracleReporter(connection: Connection, wallet: any, newReporter: PublicKey) {
  try {
    const program = getProgramInstance(connection, wallet);
    const globalStateKey = await getGlobalStatePDA();
    const transaction = new Transaction();
    const ix = await program.instruction.changeOracleReporter({
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        oracleReporter: newReporter,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction);
    console.log('tx id->', tx);
    const txResult = await connection.confirmTransaction(tx);
    if (txResult?.value?.err) {
      throw txResult.value.err;
    }
    return 'Set Oracle Reporter to' + newReporter.toBase58() + ', transaction id = ' + tx;
  } catch (e) {
    console.error('Error while setting the Oracle Reporter', e);
    throw e;
  }
}

export async function fundRatioRewards(
  connection: Connection,
  wallet: any,
  poolKey: PublicKey,
  ratioAmount: number,
  duration: number
) {
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();
  const ratioVault = getATAKey(globalStateKey, RATIO_MINT_KEY);
  const ataRatioReward = getATAKey(wallet.publicKey, RATIO_MINT_KEY);
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = program.instruction.fundRatioToken(
    new anchor.BN(Math.round(ratioAmount * 10 ** RATIO_MINT_DECIMALS)),
    new anchor.BN(duration * 24 * 3600),
    {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        pool: poolKey,
        ratioVault,
        userVault: ataRatioReward,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  );
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  const txResult = await connection.confirmTransaction(tx);
  if (txResult.value.err) {
    throw txResult.value.err;
  }
  console.log('tx id->', tx);
  return 'Funding RATIO rewards transaction id = ' + tx;
}

export async function changeFundingWallet(connection: Connection, wallet: any, fundingWallet: PublicKey) {
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.changeFundingWallet({
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      fundingWallet,
    },
  });
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  const txResult = await connection.confirmTransaction(tx);
  if (txResult.value.err) {
    throw txResult.value.err;
  }
  console.log('tx id->', tx);
  return 'Changing funding wallet transaction id = ' + tx;
}
export async function changeRatioMint(
  connection: Connection,
  wallet: any,
  ratioMint: PublicKey = new PublicKey(RATIO_MINT_KEY)
) {
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStatePDA();
  const ratioVault = getATAKey(globalStateKey, RATIO_MINT_KEY);
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.setRatioMint({
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      ratioVault,
      ratioMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  const txResult = await connection.confirmTransaction(tx);
  if (txResult.value.err) {
    throw txResult.value.err;
  }
  console.log('tx id->', tx);
  return 'Changing ratio mint transaction id = ' + tx;
}

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { WalletAdapter } from '../contexts/wallet';
import * as anchor from '@project-serum/anchor';
import {
  getGlobalStateKey,
  getGlobalState,
  getProgramInstance,
  getTokenVaultKey,
  WSOL_MINT_KEY,
  GLOBAL_STATE_TAG,
  MINT_USD_SEED,
  defaultPrograms,
  GLOBAL_TVL_LIMIT,
  GLOBAL_DEBT_CEILING,
  VAULT_SEED,
  USER_DEBT_CEILING,
} from './ratio-lending';
import { CollateralizationRatios, EmergencyState } from '../types/admin-types';
import BN from 'bn.js';
import { createSaberTokenVault } from './saber/saber-utils';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { sendTransaction } from './web3';
import { Console } from 'console';

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
    const globalStateKey = await getGlobalStateKey();
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
  } catch (error) {
    console.error('ERROR when changing the emergency state.', error);
    throw error;
  }
}

export async function createTokenVault(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey = WSOL_MINT_KEY,
  riskLevel = 0,
  platform = 'SABER'
) {
  try {
    switch (platform) {
      case 'SABER':
        return await createSaberTokenVault(connection, wallet, mintCollKey, riskLevel);
      default:
        console.error('Platform vault creation yet not implemented');
        break;
    }
  } catch (e) {
    console.log("can't create token vault");
  }
}

// This command makes an Lottery
export async function createGlobalState(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  console.log('globalStateKey', globalStateKey.toBase58());
  const [mintUsdKey, mintUsdNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(MINT_USD_SEED)],
    program.programId
  );
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
      globalStateNonce,
      mintUsdNonce,
      new anchor.BN(GLOBAL_TVL_LIMIT),
      new anchor.BN(GLOBAL_DEBT_CEILING),
      new anchor.BN(USER_DEBT_CEILING),
      {
        accounts: {
          authority: wallet.publicKey,
          globalState: globalStateKey,
          mintUsd: mintUsdKey,
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
  const globalStateKey = await getGlobalStateKey();
  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.changeAuthority({
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        newOwner,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log('------ CHANGE AUTHORITY TX --------');
    console.log(tx);
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
  const globalStateKey = await getGlobalStateKey();
  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setGlobalTvlLimit(new anchor.BN(newTvlLimit * 10 ** ADMIN_SETTINGS_DECIMALS), {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
      },
    });
    transaction.add(ix);
    const tx = await sendTransaction(connection, wallet, transaction, signers);
    console.log('------ TX GLOBAL TVL LIMIT --------');
    console.log('tx id->', tx);
  } catch (error) {
    console.log('There was an error while setting the global tvl limit', error);
    throw error;
  }
}

export async function getGlobalTVLLimit(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return (globalState.tvlLimit as number) / 10 ** ADMIN_SETTINGS_DECIMALS;
  } catch (e) {
    console.error('Error while fetching the tvl limiy');
    throw e;
  }
}

export async function getGlobalDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return (globalState.debtCeiling as number) / 10 ** ADMIN_SETTINGS_DECIMALS;
  } catch (e) {
    console.error('Error while fetching the global debt ceiling');
    throw e;
  }
}

export async function getUserDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return (globalState.userDebtCeiling as number) / 10 ** ADMIN_SETTINGS_DECIMALS;
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
  const globalStateKey = await getGlobalStateKey();

  try {
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setGlobalDebtCeiling(
      new anchor.BN(newDebtCeiling * 10 ** ADMIN_SETTINGS_DECIMALS),
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
    return true;
  } catch (error) {
    console.log('There was an error while setting the global debt ceiling', error);
    throw error;
  }
}

export async function setVaultDebtCeiling(
  connection: Connection,
  wallet: any,
  vaultDebtCeiling: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStateKey();
  const tokenVaultKey = await getTokenVaultKey(mintCollKey);
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.setVaultDebtCeiling(
    new anchor.BN(vaultDebtCeiling * 10 ** ADMIN_SETTINGS_DECIMALS),
    {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        mintColl: mintCollKey,
        vault: tokenVaultKey,
      },
    }
  );
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
  return 'Set Vault Debt Ceiling to' + vaultDebtCeiling + ', transaction id = ' + tx;
}

export async function setUserDebtCeiling(connection: Connection, wallet: any, newDebtCeiling: number) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  try {
    const program = getProgramInstance(connection, wallet);
    const globalStateKey = await getGlobalStateKey();
    const transaction = new Transaction();
    const signers: Keypair[] = [];
    const ix = await program.instruction.setUserDebtCeiling(
      new anchor.BN(newDebtCeiling * 10 ** ADMIN_SETTINGS_DECIMALS),
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
    const readValues = globalState.collPerRisklv as number[];
    const result: CollateralizationRatios = {
      cr_aaa_ratio: readValues[0] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_aa_ratio: readValues[1] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_a_ratio: readValues[2] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_bbb_ratio: readValues[3] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_bb_ratio: readValues[4] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_b_ratio: readValues[5] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_ccc_ratio: readValues[6] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_cc_ratio: readValues[7] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_c_ratio: readValues[8] / 10 ** ADMIN_SETTINGS_DECIMALS,
      cr_d_ratio: readValues[9] / 10 ** ADMIN_SETTINGS_DECIMALS,
    };
    return result;
  } catch (e) {
    console.error('Error while fetching the collateral ratios');
    throw e;
  }
}

export async function setCollateralRatio(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  values: CollateralizationRatios
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStateKey();

  const bigNumberValues = Object.values(values)?.map((value: string) => {
    return new BN(parseFloat(value) * 10 ** ADMIN_SETTINGS_DECIMALS);
  });
  console.log('BIG NUMBER VALUES');
  console.log(bigNumberValues);
  try {
    const tx = await program.rpc.setCollaterialRatio(bigNumberValues, {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
    console.log('----- TX COLLATERAL RATIO ------');
    console.log(tx);
    return true;
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
  }
}

export async function getHarvestFee(connection: Connection, wallet: WalletAdapter | undefined): Promise<number> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    const feeDeno = 1000_000;
    return (((globalState.feeNum as number) / feeDeno) * 100) / 10 ** ADMIN_SETTINGS_DECIMALS;
  } catch (e) {
    console.error('Error while fetching the tvl limiy');
    throw e;
  }
}

export async function setHarvestFee(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  feeNum: number
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStateKey();

  const feeDeno = 1000_000;
  const feeNumNew = ((feeNum * 10 ** ADMIN_SETTINGS_DECIMALS) / 100) * feeDeno;
  console.log(feeNumNew, feeDeno);
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
export async function setBorrowFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setBorrowFee yet not implemented');
}
export async function setPaybackFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setPaybackFee yet not implemented');
}
export async function setStakeFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setStakeFee yet not implemented');
}
export async function setSwapFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setSwapFee yet not implemented');
}
export async function setWithdrawFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setWithdrawFee yet not implemented');
}
export async function setDepositFee(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setDepositFee yet not implemented');
}

export async function changeTreasury(connection: Connection, wallet: any, newTreasury: PublicKey) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);
  const globalStateKey = await getGlobalStateKey();
  const transaction = new Transaction();
  const ix = await program.instruction.changeTreasury({
    accounts: {
      authority: wallet.publicKey,
      globalState: globalStateKey,
      newTreasury,
    },
  });
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction);
  console.log('tx id->', tx);
  return 'Set Treasury to' + newTreasury.toBase58() + ', transaction id = ' + tx;
}

export async function getCurrentTreasuryWallet(connection: Connection, wallet: any): Promise<PublicKey> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.treasury;
  } catch (e) {
    console.error('Error while fetching the super owner');
    throw e;
  }
}

import { Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapter } from '../contexts/wallet';
import { CollateralizationRatios } from '../types/admin-types';
import { defaultPrograms, getGlobalState, getProgramInstance, getTokenVaultByMint } from './ratio-lending';
import BN from 'bn.js';

export async function toggleEmergencyState(connection: Connection, wallet: WalletAdapter | undefined) {
  console.error('toggleEmergencyState yet not implemented');
}
export async function getCurrentEmergencyState(
  connection: Connection,
  wallet: WalletAdapter | undefined
): Promise<string> {
  console.error('getCurrentEmergencyState yet not implemented');
  return '';
}
export async function changeSuperOwner(connection: Connection, wallet: WalletAdapter | undefined, value: PublicKey) {
  console.error('changeSuperOwner yet not implemented');
}
export async function setGlobalTvlLimit(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  limit: number
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  try {
    const tx = await program.rpc.setGlobalTvlLimit(new BN(limit), {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
    console.log('------ TX GLOBAL TVL LIMIT --------');
    console.log(tx);
    return true;
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
  }
}
export async function setGlobalDebtCeiling(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  ceiling: number
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  try {
    const tx = await program.rpc.setGlobalDebtCeiling(new BN(ceiling), {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
    console.log('----- TX GLOBAL DEBT CEILING ------');
    console.log(tx);
    return true;
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
  }
}
export async function setVaultDebtCeiling(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  ceiling: number,
  mintCollKey: PublicKey
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  const { tokenVaultKey } = await getTokenVaultByMint(connection, mintCollKey.toString());

  try {
    const tx = await program.rpc.setVaultDebtcCeiling(new BN(ceiling), {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
        mintColl: mintCollKey,
        vault: tokenVaultKey,
      },
    });
    console.log('---- TX VAULT DEBT CEILING ------');
    console.log(tx);
    return true;
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
  }
}

/**
 * TO DEFINE FOR WHAT USER SHOULD BE SET THAT.
 */
export async function setUserDebtCeiling(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  value: number,
  user: PublicKey,
  mintCollKey: PublicKey
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  /**
   * try {
    const tx = await program.rpc.setGlobalDebtCeiling(new BN(ceiling), {
      accounts: {
        payer: wallet?.publicKey,
        user:
        globalState: globalStateKey,

      },
    });
    console.log('----- TX GLOBAL DEBT CEILING ------');
    console.log(tx);
    return true;
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
  }
  **/
  return true;
}
export async function setCollateralRatio(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  values: CollateralizationRatios
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  const bigNumberValues = Object.values(values)?.map((value: string) => {
    return new BN(parseFloat(value));
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
export async function setHarvestFee(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  feeNum: number
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  const feeDeno = 1000_000;
  const feeNumNew = (feeNum / 100) * feeDeno;
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

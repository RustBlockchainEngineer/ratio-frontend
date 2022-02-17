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
export async function setGlobalTvlLimit(connection: Connection, wallet: WalletAdapter | undefined, limit: number) {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  try {
    await program.rpc.setGlobalTvlLimit(limit, {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
  } catch (error) {
    console.log('ERROR');
    console.log(error);
  }
}
export async function setGlobalDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined, ceiling: number) {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  try {
    await program.rpc.setGlobalDebtCeiling(ceiling, {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
  } catch (error) {
    console.log('ERROR');
    console.log(error);
  }
}
export async function setVaultDebtCeiling(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  ceiling: number,
  mintCollKey: PublicKey
) {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  const { tokenVaultKey } = await getTokenVaultByMint(connection, mintCollKey.toString());

  try {
    await program.rpc.setVaultDebtcCeiling(ceiling, {
      accounts: {
        authority: wallet?.publicKey,
        tokenVault: tokenVaultKey,
        globalState: globalStateKey,
        mintColl: mintCollKey,
      },
    });
  } catch (error) {
    console.log('ERROR');
    console.log(error);
  }
}

export async function setUserDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setUserDebtCeiling yet not implemented');
}
export async function setCollateralRatio(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  values: CollateralizationRatios
) {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  try {
    await program.rpc.setCollateralRatio(values, {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
  } catch (error) {
    console.log('ERROR');
    console.log(error);
  }
}
export async function setHarvestFee(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  feeNum: number,
  feeDeno: number
): Promise<boolean> {
  const program = await getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  try {
    await program.rpc.setHarvestFee(new BN(feeNum), new BN(feeDeno), {
      accounts: {
        authority: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
  } catch (error) {
    console.log('ERROR');
    console.log(error);
    throw error;
    return false;
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

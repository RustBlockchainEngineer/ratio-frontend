import { Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapter } from '../contexts/wallet';
import { CollateralizationRatios } from '../types/admin-types';
import { getCurrentSuperOwner, getGlobalState, getProgramInstance, defaultPrograms } from './ratio-lending';

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
export async function setGlobalTvlLimit(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setGlobalTvlLimit yet not implemented');
}
export async function setGlobalDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setGlobalDebtCeiling yet not implemented');
}
export async function setUserDebtCeiling(connection: Connection, wallet: WalletAdapter | undefined, value: number) {
  console.error('setUserDebtCeiling yet not implemented');
}
export async function setCollateralRatio(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  values: CollateralizationRatios
) {
  console.error('setCollateralRatio yet not implemented');
}

export async function setHarvestFee(
  connection: Connection,
  wallet: WalletAdapter | undefined,
  feeNum: number,
  feeDeno: number
): Promise<boolean> {
  const program = getProgramInstance(connection, wallet);
  const { globalStateKey } = await getGlobalState(connection, wallet);
  try {
    await program.rpc.setHarvestFee(feeNum, feeDeno, {
      accounts: {
        payer: wallet?.publicKey,
        globalState: globalStateKey,
      },
    });
  } catch (e) {
    console.log('ERROR');
    console.log(e);
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

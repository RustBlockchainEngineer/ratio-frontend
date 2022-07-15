/* eslint-disable prettier/prettier */
import * as anchor from '@project-serum/anchor';

import {
  DEFAULT_PROGRAMS,
  depositCollateralTx,
  distributeRewardTx,
  getProgramInstance,
  withdrawCollateralTx,
} from '../../ratio-lending';
import {
  PublicKey,
  Transaction,
  Connection,
  // SignatureResult
} from '@solana/web3.js';
import {
  //sendSignedTransaction,
  sendTransaction,
  //signAllTransaction
} from '../../rf-web3';

import { getATAKey, getPoolPDA, getVaultPDA } from '../../ratio-pda';
import { RAYDIUM_FARM_PROGRAM_ID, RAYDIUM_FARM_VERSION } from '../../../constants/ids';
import { RAYDIUM_FARMS } from './raydium-farms';
import { FARM_LEDGER_LAYOUT_V5_2, REAL_FARM_STATE_LAYOUT_V5 } from './raydium_layout';
import BigNumber from 'bignumber.js';

export const RAY_MINT_DECIMALS = 6;

export async function deposit(
  connection: Connection,
  wallet: any,

  mintCollKey: PublicKey,

  amount: number
): Promise<string> {
  console.log('Deposit to Raydium', amount);

  const transaction = new Transaction();

  const tx1: any = await depositCollateralTx(connection, wallet, amount, mintCollKey);
  transaction.add(tx1);

  const tx3 = await stakeCollateralToRaydiumTx(amount, connection, wallet, mintCollKey);
  if (tx3) {
    transaction.add(tx3);
  }
  const txHash = await sendTransaction(connection, wallet, transaction);

  console.log('Raydium deposit tx', txHash);
  return txHash.toString();
}

export async function withdraw(connection: Connection, wallet: any, mintCollKey: PublicKey, amount: number) {
  console.log('Withdraw from Raydium', amount);

  const tx1 = new Transaction();

  const ix1 = await unstakeColalteralFromRaydiumTx(connection, wallet, amount, mintCollKey);
  if (ix1) {
    tx1.add(ix1);
  }

  const ix2 = await withdrawCollateralTx(connection, wallet, amount, mintCollKey);
  if (ix2) {
    tx1.add(ix2);
  }
  const txHash = await sendTransaction(connection, wallet, tx1);

  return txHash;
}

export async function harvest(connection: Connection, wallet: any, mintCollKey: PublicKey, needTx = false) {
  console.log('Harvest from Raydium');

  const transaction = new Transaction();

  const tx1 = await harvestRewardsFromRaydiumTx(connection, wallet, mintCollKey);
  if (tx1) {
    transaction.add(tx1);
  }

  const tx2 = await distributeRewardTx(connection, wallet, mintCollKey);
  if (tx2) {
    transaction.add(tx2);
  }
  if (!needTx) {
    const txHash = await sendTransaction(connection, wallet, transaction);

    return txHash;
  }
  return transaction;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isRaydiumLp(mintCollKey: PublicKey): boolean {
  if (!RAYDIUM_FARMS[mintCollKey.toBase58()]) {
    return false;
  }
  return true;
}
export const getRaydiumFarmInfo = async (connection: Connection, mintCollKey: PublicKey) => {
  const farmLayout = await getStateLayout(RAYDIUM_FARM_VERSION);
  const farmKey = RAYDIUM_FARMS[mintCollKey.toBase58()];
  const farmInfo = await connection.getAccountInfo(new PublicKey(farmKey));
  if (!farmInfo) {
    return null;
  }
  const parsedData = farmLayout.decode(farmInfo?.data);
  return {
    publicKey: new PublicKey(farmKey),
    parsedData,
  };
};
export const getRaydiumLedgerInfo = async (
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  mintCollKey: PublicKey
) => {
  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);
  const ledgerLayout = await getLedgerLayout(RAYDIUM_FARM_VERSION);
  const raydiumFarmInfo = await getRaydiumFarmInfo(userConnection, mintCollKey);
  const ledgerKey = await getAssociatedLedgerAccount({
    programId: RAYDIUM_FARM_PROGRAM_ID,
    poolId: raydiumFarmInfo.publicKey,
    owner: vaultKey,
  });
  const ledgerInfo = await userConnection.getAccountInfo(new PublicKey(ledgerKey));
  if (!ledgerInfo) {
    return null;
  }
  const parsedData = ledgerLayout.decode(ledgerInfo?.data);
  return {
    publicKey: ledgerKey,
    parsedData,
  };
};
const stakeCollateralToRaydiumTx = async (
  amountToStake: number,
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  mintCollKey: PublicKey
) => {
  const program = getProgramInstance(userConnection, userWallet);

  const poolKey = getPoolPDA(mintCollKey);
  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);

  const poolData = await program.account.pool.fetch(poolKey);

  const ataCollatKey = getATAKey(vaultKey, mintCollKey);
  const ataRewardKey = getATAKey(vaultKey, poolData.mintReward);
  const ataRewardBKey = getATAKey(vaultKey, poolData.swapMintA);

  const raydiumFarmInfo = await getRaydiumFarmInfo(userConnection, mintCollKey);

  const stakerInfo = await getAssociatedLedgerAccount({
    programId: RAYDIUM_FARM_PROGRAM_ID,
    poolId: raydiumFarmInfo.publicKey,
    owner: vaultKey,
  });
  const farmAuthority = (
    await getAssociatedAuthority({
      programId: RAYDIUM_FARM_PROGRAM_ID,
      poolId: raydiumFarmInfo.publicKey,
    })
  ).publicKey;
  console.log('staking to Raydium');
  const txn = new Transaction().add(
    program.instruction.stakeCollateralToRaydium(new anchor.BN(amountToStake), {
      accounts: {
        authority: userWallet.publicKey,
        pool: poolKey,
        vault: vaultKey,
        raydiumProgram: RAYDIUM_FARM_PROGRAM_ID,
        stakePool: raydiumFarmInfo.publicKey,
        poolAuthority: farmAuthority,
        stakerInfo,
        ataCollatVault: ataCollatKey,
        vaultLpToken: raydiumFarmInfo.parsedData.lpVault,
        destRewardTokenA: ataRewardKey,
        vaultRewardTokenA: raydiumFarmInfo.parsedData.rewardVaultA,
        destRewardTokenB: ataRewardBKey,
        vaultRewardTokenB: raydiumFarmInfo.parsedData.rewardVaultB,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  return txn;
};

const unstakeColalteralFromRaydiumTx = async (
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  unstakeAmount: number,
  mintCollKey: PublicKey
) => {
  const program = getProgramInstance(userConnection, userWallet);

  const poolKey = getPoolPDA(mintCollKey);
  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);

  const poolData = await program.account.pool.fetch(poolKey);

  const ataCollatKey = getATAKey(vaultKey, mintCollKey);
  const ataRewardKey = getATAKey(vaultKey, poolData.mintReward);
  const ataRewardBKey = getATAKey(vaultKey, poolData.swapMintA);

  const raydiumFarmInfo = await getRaydiumFarmInfo(userConnection, mintCollKey);

  const stakerInfo = await getAssociatedLedgerAccount({
    programId: RAYDIUM_FARM_PROGRAM_ID,
    poolId: raydiumFarmInfo.publicKey,
    owner: vaultKey,
  });
  const farmAuthority = (
    await getAssociatedAuthority({
      programId: RAYDIUM_FARM_PROGRAM_ID,
      poolId: raydiumFarmInfo.publicKey,
    })
  ).publicKey;
  console.log('staking to Raydium');
  const txn = new Transaction().add(
    program.instruction.unstakeCollateralFromRaydium(new anchor.BN(unstakeAmount), {
      accounts: {
        authority: userWallet.publicKey,
        pool: poolKey,
        vault: vaultKey,
        raydiumProgram: RAYDIUM_FARM_PROGRAM_ID,
        stakePool: raydiumFarmInfo.publicKey,
        poolAuthority: farmAuthority,
        stakerInfo,
        ataCollatVault: ataCollatKey,
        vaultLpToken: raydiumFarmInfo.parsedData.lpVault,
        destRewardTokenA: ataRewardKey,
        vaultRewardTokenA: raydiumFarmInfo.parsedData.rewardVaultA,
        destRewardTokenB: ataRewardBKey,
        vaultRewardTokenB: raydiumFarmInfo.parsedData.rewardVaultB,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  return txn;
};

const harvestRewardsFromRaydiumTx = async (
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  mintCollKey: PublicKey
) => {
  const program = getProgramInstance(userConnection, userWallet);

  const poolKey = getPoolPDA(mintCollKey);
  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);

  const poolData = await program.account.pool.fetch(poolKey);

  const ataCollatKey = getATAKey(vaultKey, mintCollKey);
  const ataRewardKey = getATAKey(vaultKey, poolData.mintReward);
  const ataRewardBKey = getATAKey(vaultKey, poolData.swapMintA);

  const raydiumFarmInfo = await getRaydiumFarmInfo(userConnection, mintCollKey);

  const stakerInfo = await getAssociatedLedgerAccount({
    programId: RAYDIUM_FARM_PROGRAM_ID,
    poolId: raydiumFarmInfo.publicKey,
    owner: vaultKey,
  });
  const farmAuthority = (
    await getAssociatedAuthority({
      programId: RAYDIUM_FARM_PROGRAM_ID,
      poolId: raydiumFarmInfo.publicKey,
    })
  ).publicKey;
  console.log('staking to Raydium');
  const txn = new Transaction().add(
    program.instruction.harvestRewardsFromRaydium({
      accounts: {
        authority: userWallet.publicKey,
        pool: poolKey,
        vault: vaultKey,
        raydiumProgram: RAYDIUM_FARM_PROGRAM_ID,
        stakePool: raydiumFarmInfo.publicKey,
        poolAuthority: farmAuthority,
        stakerInfo,
        ataCollatVault: ataCollatKey,
        vaultLpToken: raydiumFarmInfo.parsedData.lpVault,
        destRewardTokenA: ataRewardKey,
        vaultRewardTokenA: raydiumFarmInfo.parsedData.rewardVaultA,
        destRewardTokenB: ataRewardBKey,
        vaultRewardTokenB: raydiumFarmInfo.parsedData.rewardVaultB,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  return txn;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function calculateRaydiumReward(userConnection: Connection, userWallet: any, mintCollKey: PublicKey) {
  const raydiumFarmInfo = await getRaydiumFarmInfo(userConnection, mintCollKey);
  const ledgerInfo = await getRaydiumLedgerInfo(userConnection, userWallet, mintCollKey);

  //   const currentSlot = new BN(Math.round(Date.now() / 1000));
  //   const lastSlot = raydiumFarmInfo.parsedData.lastSlot;
  const perShareReward = new BigNumber(raydiumFarmInfo.parsedData.perShareRewardA.toString());
  //   const perSlotReward = raydiumFarmInfo.parsedData.perSlotRewardA;
  const ledgerDebt = new BigNumber(ledgerInfo.parsedData.rewardDebts[0].toString());
  const deposited = new BigNumber(ledgerInfo.parsedData.deposited.toString());
  const pendingRewards = deposited.multipliedBy(perShareReward).dividedBy(new BigNumber(1e15)).minus(ledgerDebt);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const uiPendingRewards = pendingRewards.toNumber() / 10 ** RAY_MINT_DECIMALS;
  return uiPendingRewards;
}
export const getAssociatedAuthority = ({ programId, poolId }: { programId: PublicKey; poolId: PublicKey }) => {
  return findProgramAddress([poolId.toBuffer()], programId);
};

export async function findProgramAddress(seeds: Array<Buffer | Uint8Array>, programId: PublicKey) {
  const [publicKey, nonce] = await PublicKey.findProgramAddress(seeds, programId);
  return { publicKey, nonce };
}
export async function getAssociatedLedgerAccount({
  programId,
  poolId,
  owner,
}: {
  programId: PublicKey;
  poolId: PublicKey;
  owner: PublicKey;
}) {
  // eslint-disable-next-line prefer-const
  let farmVersion = RAYDIUM_FARM_VERSION;
  const { publicKey } = await findProgramAddress(
    [
      poolId.toBuffer(),
      owner.toBuffer(),
      Buffer.from(farmVersion === 6 ? 'farmer_info_associated_seed' : 'staker_info_v2_associated_seed', 'utf-8'),
    ],
    programId
  );
  return publicKey;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getStateLayout(version: number) {
  const STATE_LAYOUT = REAL_FARM_STATE_LAYOUT_V5; //FARM_VERSION_TO_STATE_LAYOUT[version];
  return STATE_LAYOUT;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getLedgerLayout(version: number) {
  const LEDGER_LAYOUT = FARM_LEDGER_LAYOUT_V5_2; //FARM_VERSION_TO_LEDGER_LAYOUT[version];
  return LEDGER_LAYOUT;
}

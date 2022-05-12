import * as anchor from '@project-serum/anchor';
import * as serumCmn from '@project-serum/common';

import {
  DEFAULT_PROGRAMS,
  depositCollateralTx,
  distributeRewardTx,
  getProgramInstance,
  withdrawCollateralTx,
} from '../ratio-lending';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import {
  findMinerAddress,
  findMinterAddress,
  findQuarryAddress,
  QuarrySDK,
  QUARRY_ADDRESSES,
} from '@quarryprotocol/quarry-sdk';
import { Token as SToken } from '@saberhq/token-utils';
import { sendAllTransaction, sendTransaction } from '../web3';
import { SABER_MINT_WRAPPER, SABER_REWARDER, SABER_REWARD_IOU_MINT, SABER_REWARD_MINT_REDEEM } from './constants';
import { TokenAmount } from '../safe-math';
import { getATAKey, getGlobalStatePDA, getPoolPDA, getVaultPDA } from '../ratio-pda';
import { Saber } from '@saberhq/saber-periphery';

const rewarderKey = new PublicKey(SABER_REWARDER);
const mintWrapperKey = new PublicKey(SABER_MINT_WRAPPER);
const saberMintKey = new PublicKey(SABER_REWARD_IOU_MINT);
export async function deposit(
  connection: Connection,
  wallet: any,

  mintCollKey: PublicKey,
  userTokenATA: string | PublicKey,

  amount: number
): Promise<string> {
  console.log('Deposit to Saber', amount);

  const transaction = new Transaction();

  const tx1: any = await depositCollateralTx(connection, wallet, amount, mintCollKey, new PublicKey(userTokenATA));
  transaction.add(tx1);

  const tx2 = await createSaberQuarryMinerIfneededTx(connection, wallet, mintCollKey);
  if (tx2) {
    transaction.add(tx2);
  }

  const tx3 = await stakeCollateralToSaberTx(amount, connection, wallet, mintCollKey);
  if (tx3) {
    transaction.add(tx3);
  }
  const txHash = await sendTransaction(connection, wallet, transaction);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log('Saber deposit tx', txHash);
  return txHash.toString();
}

export async function withdraw(connection: Connection, wallet: any, mintCollKey: PublicKey, amount: number) {
  console.log('Withdraw from Saber', amount);

  const tx1 = new Transaction();

  const ix1 = await unstakeColalteralFromSaberTx(connection, wallet, amount, mintCollKey);
  if (ix1) {
    tx1.add(ix1);
  }

  const ix2 = await withdrawCollateralTx(connection, wallet, amount, mintCollKey);
  if (ix2) {
    tx1.add(ix2);
  }
  const tx2 = new Transaction();
  const ix3 = await harvestRewardsFromSaberTx(connection, wallet, mintCollKey);
  if (ix3) {
    tx2.add(ix3);
  }

  const ix4 = await distributeRewardTx(connection, wallet, mintCollKey);
  if (ix4) {
    tx2.add(ix4);
  }

  const ix5 = await redeemAllTokensTx(connection, wallet);
  if (ix5) {
    tx2.add(ix5);
  }

  const txHashs = await sendAllTransaction(connection, wallet, [tx1, tx2]);

  await connection.confirmTransaction(txHashs[0]);
  if (txHashs[0]?.value?.err) {
    console.error('ERROR ON TX ', txHashs[0].value.err);
    throw txHashs[0].value.err;
  }

  console.log('Saber withdraw tx', txHashs[0]);
  console.log('Saber harvest tx', txHashs[1]);

  return txHashs[0];
}

export async function harvest(connection: Connection, wallet: any, mintCollKey: PublicKey) {
  console.log('Harvest from Saber');

  const transaction = new Transaction();

  const tx1 = await harvestRewardsFromSaberTx(connection, wallet, mintCollKey);
  if (tx1) {
    transaction.add(tx1);
  }

  const tx2 = await distributeRewardTx(connection, wallet, mintCollKey);
  if (tx2) {
    transaction.add(tx2);
  }
  const tx3 = await redeemAllTokensTx(connection, wallet);
  if (tx3) {
    transaction.add(tx3);
  }

  const txHash = await sendTransaction(connection, wallet, transaction);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log('Saber harvest tx', txHash);

  return txHash;
}

export const createSaberQuarryMinerIfneededTx = async (
  connection: Connection,
  wallet: typeof anchor.Wallet,
  mintCollKey: PublicKey
) => {
  const program = getProgramInstance(connection, wallet);

  const vaultKey = getVaultPDA(wallet.publicKey, mintCollKey);
  const transaction = new Transaction();

  const sdk: QuarrySDK = QuarrySDK.load({
    provider: program.provider as any,
  });
  const rewarder = await sdk.mine.loadRewarderWrapper(rewarderKey);

  const collMintInfo = await serumCmn.getMintInfo(program.provider, mintCollKey);

  const poolMintToken = SToken.fromMint(mintCollKey, collMintInfo.decimals);
  const quarry = await rewarder.getQuarry(poolMintToken);

  const miner = await quarry.getMiner(vaultKey);

  if (!miner) {
    console.log('creating quarry miner');
    const poolKey = getPoolPDA(mintCollKey);

    const [quarry] = await findQuarryAddress(rewarderKey, mintCollKey, QUARRY_ADDRESSES.Mine);

    const [minerKey, minerBump] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
    const ataCollatMinerKey = getATAKey(minerKey, mintCollKey);
    transaction.add(
      // programPeriphery.instruction.createSaberQuarryMiner(miner.bump, {
      program.instruction.createSaberQuarryMiner(minerBump, {
        accounts: {
          authority: wallet.publicKey,
          pool: poolKey,
          vault: vaultKey,
          miner: minerKey,
          ataCollatMiner: ataCollatMinerKey,
          // quarry
          quarry: quarry,
          rewarder: rewarderKey,
          mintCollat: mintCollKey,
          quarryProgram: QUARRY_ADDRESSES.Mine,
          ...DEFAULT_PROGRAMS,
        },
      })
    );
  }
  return transaction;
};

const stakeCollateralToSaberTx = async (
  amountToStake: number,
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  mintCollKey: PublicKey
) => {
  const program = getProgramInstance(userConnection, userWallet);

  const poolKey = getPoolPDA(mintCollKey);
  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);

  const ataCollatVault = getATAKey(vaultKey, mintCollKey);
  const [quarry] = await findQuarryAddress(rewarderKey, mintCollKey, QUARRY_ADDRESSES.Mine);

  const [minerKey] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
  const ataCollatMiner = getATAKey(minerKey, mintCollKey);

  console.log('staking to saber');

  const txn = new Transaction().add(
    program.instruction.stakeCollateralToSaber(new anchor.BN(amountToStake), {
      accounts: {
        authority: userWallet.publicKey,
        pool: poolKey,
        vault: vaultKey,
        ataCollatVault: ataCollatVault,
        ataCollatMiner: ataCollatMiner,
        quarry,
        miner: minerKey,
        rewarder: rewarderKey,
        quarryProgram: QUARRY_ADDRESSES.Mine,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  return txn;
};

const unstakeColalteralFromSaberTx = async (
  connection: Connection,
  wallet: typeof anchor.Wallet,
  unstakeAmount: number,
  mintCollKey: PublicKey
) => {
  const program = getProgramInstance(connection, wallet);

  const poolKey = getPoolPDA(mintCollKey);
  const vaultKey = getVaultPDA(wallet.publicKey, mintCollKey);

  const ataCollatVault = getATAKey(vaultKey, mintCollKey);
  const [quarry] = await findQuarryAddress(rewarderKey, mintCollKey, QUARRY_ADDRESSES.Mine);

  const [minerKey] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
  const ataCollatMiner = getATAKey(minerKey, mintCollKey);

  const transaction = new Transaction();

  transaction.add(
    program.instruction.unstakeCollateralFromSaber(new anchor.BN(unstakeAmount), {
      accounts: {
        authority: wallet.publicKey,
        pool: poolKey,
        vault: vaultKey,
        ataCollatVault: ataCollatVault,
        ataCollatMiner: ataCollatMiner,
        quarry,
        miner: minerKey,
        rewarder: rewarderKey,
        quarryProgram: QUARRY_ADDRESSES.Mine,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  return transaction;
};

export const harvestRewardsFromSaberTx = async (
  connection: Connection,
  wallet: typeof anchor.Wallet,
  mintCollKey: PublicKey
) => {
  const program = getProgramInstance(connection, wallet);
  const sdk = QuarrySDK.load({
    provider: program.provider as any,
  });

  const rewarderWrapper = await sdk.mine.loadRewarderWrapper(rewarderKey);
  const claimFeeTokenAccount = rewarderWrapper.rewarderData.claimFeeTokenAccount;

  const [minter] = await findMinterAddress(mintWrapperKey, rewarderKey, QUARRY_ADDRESSES.MintWrapper);
  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintCollKey);
  const vaultKey = getVaultPDA(wallet.publicKey, mintCollKey);

  const ataCollatVaultKey = getATAKey(vaultKey, mintCollKey);
  const [quarry] = await findQuarryAddress(rewarderKey, mintCollKey, QUARRY_ADDRESSES.Mine);

  const [minerKey] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
  const ataCollatMinerKey = getATAKey(minerKey, mintCollKey);

  const ataRewardVaultKey = getATAKey(vaultKey, SABER_REWARD_IOU_MINT);

  const txn = new Transaction().add(
    program.instruction.harvestRewardsFromSaber({
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        pool: poolKey,
        vault: vaultKey,
        ataRewardVault: ataRewardVaultKey,
        ataCollatMiner: ataCollatMinerKey,
        ataCollatVault: ataCollatVaultKey, // this is SBR for this example
        quarry,
        miner: minerKey,
        rewarder: rewarderKey,
        mintWrapper: mintWrapperKey,
        mintWrapperProgram: QUARRY_ADDRESSES.MintWrapper,
        minter,
        claimFeeTokenAccount, // is this a quarry-specific account
        // system accounts
        mintReward: SABER_REWARD_IOU_MINT, // SBR for this example
        quarryProgram: QUARRY_ADDRESSES.Mine,
        ...DEFAULT_PROGRAMS,
      },
    })
  );
  return txn;
};

export const redeemAllTokensTx = async (connection: Connection, wallet: typeof anchor.Wallet) => {
  const program = getProgramInstance(connection, wallet);
  const sdk = Saber.load({
    provider: program.provider as any,
  });

  const redeemer = await sdk.loadRedeemer({
    iouMint: new PublicKey(SABER_REWARD_IOU_MINT),
    redemptionMint: new PublicKey(SABER_REWARD_MINT_REDEEM),
  });

  const ataSaberIouVaultKey = getATAKey(wallet.publicKey, SABER_REWARD_IOU_MINT);
  const ataSaberProtocolVaultKey = getATAKey(wallet.publicKey, SABER_REWARD_MINT_REDEEM);

  const txn = new Transaction().add(
    await redeemer.redeemAllTokensFromMintProxyIx({
      sourceAuthority: wallet.publicKey,
      iouSource: ataSaberIouVaultKey,
      redemptionDestination: ataSaberProtocolVaultKey,
    })
  );
  return txn;
};

export async function calculateSaberReward(connection: Connection, wallet: any, mintCollKey: PublicKey) {
  try {
    const program = getProgramInstance(connection, wallet);

    const vaultKey = getVaultPDA(wallet.publicKey, mintCollKey);

    const sdk: QuarrySDK = QuarrySDK.load({
      provider: program.provider as any,
    });
    const rewarder = await sdk.mine.loadRewarderWrapper(rewarderKey);

    const collMintInfo = await serumCmn.getMintInfo(program.provider, mintCollKey);
    const rewardMintInfo = await serumCmn.getMintInfo(program.provider, saberMintKey);

    const poolMintToken = SToken.fromMint(mintCollKey, collMintInfo.decimals);
    const quarry = await rewarder.getQuarry(poolMintToken);

    const miner = await quarry.getMiner(vaultKey);
    if (miner) {
      const payroll = quarry.payroll;

      const currentTimeStamp = new anchor.BN(Math.ceil(new Date().getTime() / 1000));

      const expectedWagesEarned = (
        await payroll.calculateRewardsEarned(
          currentTimeStamp,
          miner?.balance as anchor.BN,
          miner?.rewardsPerTokenPaid as anchor.BN,
          miner?.rewardsEarned as anchor.BN
        )
      ).toNumber();
      return parseFloat(new TokenAmount(expectedWagesEarned, rewardMintInfo.decimals).fixed());
    } else {
      return 0;
    }
  } catch (e) {
    console.log(e);
    return 0;
  }
}

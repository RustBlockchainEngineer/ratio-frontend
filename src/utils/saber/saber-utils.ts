import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as serumCmn from '@project-serum/common';

import { depositCollateral, getGlobalState, getProgramInstance, withdrawCollateral } from '../ratio-lending';
import { PublicKey, SystemProgram, Transaction, Connection, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import {
  findMinerAddress,
  findMinterAddress,
  findQuarryAddress,
  QuarrySDK,
  QUARRY_ADDRESSES,
} from '@quarryprotocol/quarry-sdk';
import { Token as SToken } from '@saberhq/token-utils';
import { sendTransaction } from '../web3';
import { SABER_MINT_WRAPPER, SABER_REWARDER, SABER_REWARD_MINT } from './constants';
import { TokenAmount } from '../safe-math';
import { getATAKey, getGlobalStatePDA, getPoolPDA, getVaultPDA } from '../ratio-pda';

export async function depositToSaber(
  connection: Connection,
  wallet: any,

  amount: number,

  mintCollKey: PublicKey,
  userTokenATA: PublicKey,

  ataMarketA: PublicKey,
  ataMarketB: PublicKey
): Promise<string> {
  console.log('Deposit to Saber', amount);

  const transaction = new Transaction();

  const tx1: any = await depositCollateral(
    connection,
    wallet,
    amount,
    mintCollKey,
    userTokenATA,
    ataMarketA,
    ataMarketB,
    true
  );
  transaction.add(tx1);

  const tx2 = await createSaberQuarryMinerIfneeded(connection, wallet, mintCollKey, true);
  if (tx2) {
    transaction.add(tx2);
  }

  const tx3 = await stakeCollateralToSaber(amount, connection, wallet, mintCollKey, true);
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

export async function withdrawFromSaber(connection: Connection, wallet: any, mintCollKey: PublicKey, amount: number) {
  console.log('Withdraw from Saber', amount);

  const transaction = new Transaction();

  const tx1 = await unstakeColalteralFromSaber(amount, connection, wallet, mintCollKey, true);
  if (tx1) {
    transaction.add(tx1);
  }

  const tx2 = await withdrawCollateral(connection, wallet, amount, mintCollKey, true);
  if (tx2) {
    transaction.add(tx2);
  }

  const tx3 = await harvestRewardsFromSaber(connection, wallet, mintCollKey, true);
  if (tx3) {
    transaction.add(tx3);
  }

  const txHash = await sendTransaction(connection, wallet, transaction);
  await connection.confirmTransaction(txHash);
  if (txHash?.value?.err) {
    console.error('ERROR ON TX ', txHash.value.err);
    throw txHash.value.err;
  }
  console.log('Saber withdraw tx', txHash);

  return txHash;
}

export const createSaberQuarryMinerIfneeded = async (
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  mintCollKey: PublicKey,
  needTx = false
) => {
  const program = getProgramInstance(userConnection, userWallet);

  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);
  const transaction = new Transaction();

  const sdk: QuarrySDK = QuarrySDK.load({
    provider: program.provider,
  });
  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);

  const collMintInfo = await serumCmn.getMintInfo(program.provider, mintCollKey);

  const poolMintToken = SToken.fromMint(mintCollKey, collMintInfo.decimals);
  const quarry = await rewarder.getQuarry(poolMintToken);

  try {
    await quarry.getMiner(vaultKey);
  } catch {
    const rewarder = SABER_REWARDER;
    const poolKey = getPoolPDA(mintCollKey);

    const [quarry] = await findQuarryAddress(rewarder, mintCollKey, QUARRY_ADDRESSES.Mine);

    const [minerKey, minerBump] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
    const minerAtaPubKey = getATAKey(minerKey, mintCollKey);
    transaction.add(
      // programPeriphery.instruction.createSaberQuarryMiner(miner.bump, {
      program.instruction.createSaberQuarryMiner(minerBump, {
        accounts: {
          authority: userWallet.publicKey,
          pool: poolKey,
          vault: vaultKey,
          miner: minerKey,
          minerVault: minerAtaPubKey,
          // quarry
          quarry: quarry,
          rewarder: rewarder,
          mint: mintCollKey,
          quarryProgram: QUARRY_ADDRESSES.Mine,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        },
      })
    );
  }
  if (needTx) {
    return transaction;
  }
  // send transaction
  const receipt = await handleTxn(transaction, userConnection, userWallet);
  console.log('receipt', receipt);
  // return receipt;
};

/* eslint-disable */
const stakeCollateralToSaber = async (
  amountToStake: number,
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  mintCollKey: PublicKey,
  needTx = false
) => {
  const rewarder = SABER_REWARDER;
  const program = getProgramInstance(userConnection, userWallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintCollKey);
  const userTokenATA = getATAKey(userWallet.publicKey, mintCollKey);
  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);

  const valutATA = getATAKey(vaultKey, mintCollKey);
  const [quarry] = await findQuarryAddress(rewarder, mintCollKey, QUARRY_ADDRESSES.Mine);

  const [minerKey] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
  const minerAtaPubKey = getATAKey(minerKey, mintCollKey);

  const txn = new Transaction().add(
    program.instruction.stakeCollateralToSaber(new anchor.BN(amountToStake), {
      accounts: {
        authority: userWallet.publicKey,
        globalState: globalStateKey,
        pool: poolKey,
        vault: vaultKey,
        ataVault: valutATA,
        ataUser: userTokenATA,
        mint: mintCollKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        quarry,
        miner: minerKey,
        minerVault: minerAtaPubKey,
        rewarder,
        quarryProgram: QUARRY_ADDRESSES.Mine,
      },
    })
  );
  if (needTx) {
    return txn;
  }
  await handleTxn(txn, userConnection, userWallet);
};

/* eslint-disable */
const unstakeColalteralFromSaber = async (
  unstakeAmount: number,
  userConnection: Connection,
  userWallet: typeof anchor.Wallet,
  mintCollKey: PublicKey,
  needTx = false
) => {
  const rewarder = SABER_REWARDER;
  const program = getProgramInstance(userConnection, userWallet);

  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintCollKey);
  const userTokenATA = getATAKey(userWallet.publicKey, mintCollKey);
  const vaultKey = getVaultPDA(userWallet.publicKey, mintCollKey);

  const valutATA = getATAKey(vaultKey, mintCollKey);
  const [quarry] = await findQuarryAddress(rewarder, mintCollKey, QUARRY_ADDRESSES.Mine);

  const [minerKey] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
  const minerAtaPubKey = getATAKey(minerKey, mintCollKey);

  const txn = new Transaction().add(
    program.instruction.unstakeCollateralFromSaber(new anchor.BN(unstakeAmount), {
      accounts: {
        authority: userWallet.publicKey,
        globalState: globalStateKey,
        pool: poolKey,
        vault: vaultKey,
        ataVault: valutATA,
        ataUser: userTokenATA,
        mint: mintCollKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        quarry,
        miner: minerKey,
        minerVault: minerAtaPubKey,
        rewarder,
        quarryProgram: QUARRY_ADDRESSES.Mine,
      },
    })
  );
  if (needTx) {
    return txn;
  }
  await handleTxn(txn, userConnection, userWallet);
};

export const harvestRewardsFromSaber = async (
  connection: Connection,
  wallet: typeof anchor.Wallet,
  mintCollKey: PublicKey,
  needTx = false
) => {
  const program = getProgramInstance(connection, wallet);
  const sdk = QuarrySDK.load({
    provider: program.provider,
  });
  const rewarder = SABER_REWARDER;
  const rewarderWrapper = await sdk.mine.loadRewarderWrapper(rewarder);
  const claimFeeTokenAccount = rewarderWrapper.rewarderData.claimFeeTokenAccount;
  const mintWrapper = SABER_MINT_WRAPPER;
  const [minter] = await findMinterAddress(mintWrapper, rewarder, QUARRY_ADDRESSES.MintWrapper);
  const globalStateKey = getGlobalStatePDA();
  const poolKey = getPoolPDA(mintCollKey);
  const vaultKey = getVaultPDA(wallet.publicKey, mintCollKey);

  const valutATA = getATAKey(vaultKey, mintCollKey);
  const [quarry] = await findQuarryAddress(rewarder, mintCollKey, QUARRY_ADDRESSES.Mine);

  const [minerKey] = await findMinerAddress(quarry, vaultKey, QUARRY_ADDRESSES.Mine);
  const minerAtaPubKey = getATAKey(minerKey, mintCollKey);

  const userRewardTokenATA = getATAKey(wallet.publicKey, mintCollKey);

  const { globalState } = await getGlobalState(connection, wallet);
  const treasury = globalState.treasury;
  const ataTreasurySbr = getATAKey(treasury, SABER_REWARD_MINT);
  const sbrATA = getATAKey(vaultKey, SABER_REWARD_MINT);

  const txn = new Transaction().add(
    program.instruction.harvestRewardsFromSaber({
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        pool: poolKey,
        vault: vaultKey,
        ataRewardVault: sbrATA,
        ataUserReward: userRewardTokenATA,
        ataRatioTreasury: ataTreasurySbr, // this is SBR for this example
        treasury,
        mint: mintCollKey,
        quarry,
        miner: minerKey,
        minerVault: minerAtaPubKey,
        ataVault: valutATA,
        // quarry-specific accounts
        rewarder,
        mintWrapper,
        mintWrapperProgram: QUARRY_ADDRESSES.MintWrapper,
        minter,
        claimFeeTokenAccount, // is this a quarry-specific account
        // system accounts
        mintReward: SABER_REWARD_MINT, // SBR for this example
        quarryProgram: QUARRY_ADDRESSES.Mine,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    })
  );
  if (needTx) {
    return txn;
  }
  await handleTxn(txn, connection, wallet);
};

export async function calculateSaberReward(connection: Connection, wallet: any, mintCollKey: PublicKey) {
  try {
    const program = getProgramInstance(connection, wallet);

    const vaultKey = getVaultPDA(wallet.publicKey, mintCollKey);

    const sdk: QuarrySDK = QuarrySDK.load({
      provider: program.provider,
    });
    const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);

    const collMintInfo = await serumCmn.getMintInfo(program.provider, mintCollKey);
    const rewardMintInfo = await serumCmn.getMintInfo(program.provider, SABER_REWARD_MINT);

    const poolMintToken = SToken.fromMint(mintCollKey, collMintInfo.decimals);
    const quarry = await rewarder.getQuarry(poolMintToken);

    const miner = await quarry.getMiner(vaultKey);
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
  } catch (e) {
    console.log(e);
    return 0;
  }
}

/* eslint-enable */
export const handleTxn = async (
  txn: anchor.web3.Transaction,
  userConnection: Connection,
  userWallet: typeof anchor.Wallet
) => {
  // prep txn
  txn.feePayer = userWallet.publicKey;
  txn.recentBlockhash = (await userConnection.getLatestBlockhash()).blockhash;

  // send txn
  try {
    const signedTxn: Transaction = await userWallet.signTransaction(txn);
    const rawTxn: Buffer = signedTxn.serialize();
    const options = {
      skipPreflight: true,
      commitment: 'singleGossip',
    };

    const receipt: string = await userConnection.sendRawTransaction(rawTxn, options);
    const confirmation: anchor.web3.RpcResponseAndContext<anchor.web3.SignatureResult> =
      await userConnection.confirmTransaction(receipt);
    if (confirmation.value.err) throw new Error(JSON.stringify(confirmation.value.err));
    else return receipt;
  } catch (error) {
    console.log(error);
  }
};

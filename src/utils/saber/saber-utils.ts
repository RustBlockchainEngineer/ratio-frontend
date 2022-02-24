import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as serumCmn from '@project-serum/common';
import BN from 'bn.js';

import {
  getProgramInstance,
  GLOBAL_STATE_TAG,
  PlatformType,
  VAULT_SEED,
  TYPE_ID_SABER,
  TROVE_POOL_SEED,
  TROVE_SEED,
  WSOL_MINT_KEY,
} from '../ratio-lending';
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  Connection,
} from '@solana/web3.js';
import {
  findMinerAddress,
  findMinterAddress,
  findQuarryAddress,
  QuarrySDK,
  QUARRY_ADDRESSES,
} from '@quarryprotocol/quarry-sdk';
import { Token as SToken } from '@saberhq/token-utils';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { createAssociatedTokenAccount, findAssociatedTokenAddress } from '../raydium/web3';
import { getOneFilteredTokenAccountsByOwner, sendTransaction } from '../web3';
import { FEE_OWNER, SABER_MINT_WRAPPER, SABER_REWARDER, SABER_REWARD_MINT } from './constants';
import { WalletAdapter } from '../../contexts/wallet';

const defaultAccounts = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  systemProgram: SystemProgram.programId,
  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
};

export async function createSaberTokenVault(
  connection: Connection,
  wallet: WalletAdapter,
  mintCollKey: PublicKey = WSOL_MINT_KEY,
  riskLevel = 0
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const globalState = await program.account.globalState.fetch(globalStateKey);

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  console.log('tokenVaultKey', tokenVaultKey.toBase58());

  try {
    await program.rpc.createVault(tokenVaultNonce, riskLevel, 0, new anchor.BN(100_000_000_000_000), TYPE_ID_SABER, {
      accounts: {
        authority: wallet.publicKey,
        vault: tokenVaultKey,
        globalState: globalStateKey,
        mintColl: mintCollKey,
        ...defaultAccounts,
      },
    });
    return 'created token vault successfully';
  } catch (e) {
    console.log("can't create token vault");
    console.log('program:', program);
    console.error(e);
  }
}
export async function createSaberUserTrove(connection: Connection, wallet: any, mintCollKey: PublicKey) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  console.log('Create Saber UserTrove');

  const program = getProgramInstance(connection, wallet);

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveRewardKey, userTroveRewardNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), SABER_REWARD_MINT.toBuffer()],
    program.programId
  );

  const ix1 = await program.instruction.createTrove(userTroveNonce, userTroveTokenVaultNonce, new anchor.BN(0), {
    accounts: {
      vault: tokenVaultKey,
      trove: userTroveKey,
      authority: wallet.publicKey,

      ataTrove: userTroveTokenVaultKey,
      mintColl: mintCollKey,

      ...defaultAccounts,
    },
  });

  const ix2 = await program.instruction.createUserRewardVault(userTroveRewardNonce, {
    accounts: {
      authority: wallet.publicKey,
      trove: userTroveKey,
      vault: tokenVaultKey,

      rewardVault: userTroveRewardKey,
      rewardMint: SABER_REWARD_MINT,

      ...defaultAccounts,
    },
  });

  const [quarryKey] = await findQuarryAddress(SABER_REWARDER, mintCollKey);

  const [userMinerKey, userMinerBump] = await findMinerAddress(quarryKey, userTroveKey);

  const [userMinerVaultKey, userMinerVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  const ix3 = await program.instruction.createQuarryMiner(userMinerBump, userMinerVaultBump, {
    accounts: {
      vault: tokenVaultKey,
      trove: userTroveKey,
      payer: wallet.publicKey,
      miner: userMinerKey,
      quarry: quarryKey,
      rewarder: SABER_REWARDER,
      minerVault: userMinerVaultKey,
      tokenMint: mintCollKey,
      quarryProgram: QUARRY_ADDRESSES.Mine,
      ...defaultAccounts,
    },
    instrunctions: [ix1, ix2],
  });

  const transaction = new Transaction();
  transaction.add(...[ix1, ix2, ix3]);

  const txHash = await sendTransaction(connection, wallet, transaction, []);

  return txHash;
}
export async function depositToSaber(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey,
  amount: number,
  userCollAddress: PublicKey
) {
  console.log('Deposit to Saber', amount);

  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const [quarryKey] = await findQuarryAddress(SABER_REWARDER, mintCollKey);

  const [userMinerKey, userMinerBump] = await findMinerAddress(quarryKey, userTroveKey);

  const [userMinerVaultKey, userMinerVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const txHash = await program.rpc.depositToSaber(new anchor.BN(amount), {
    accounts: {
      ratioStaker: {
        globalState: globalStateKey,
        vault: tokenVaultKey,
        trove: userTroveKey,
        authority: wallet.publicKey,
        ataTrove: userTroveTokenVaultKey,
        ataUserColl: userCollAddress,
        mintColl: mintCollKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      saberFarm: {
        quarry: quarryKey,
        miner: userMinerKey,
        minerVault: userMinerVaultKey,
      },
      saberFarmRewarder: SABER_REWARDER,
      saberFarmProgram: QUARRY_ADDRESSES.Mine,
    },
  });
  return txHash;
}

export async function withdrawFromSaber(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey,
  amount: number,
  userCollAddress: PublicKey
) {
  console.log('Withdraw from Saber', amount);

  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  const sdk: QuarrySDK = QuarrySDK.load({
    provider: program.provider,
  });
  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);

  const quarryKey = await rewarder.getQuarryKeyForMint(mintCollKey);

  const [userMinerKey, userMinerBump] = await findMinerAddress(quarryKey, userTroveKey);

  const [userMinerVaultKey, userMinerVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const txHash = await program.rpc.withdrawFromSaber(new anchor.BN(amount), {
    accounts: {
      ratioStaker: {
        globalState: globalStateKey,
        vault: tokenVaultKey,
        trove: userTroveKey,
        authority: wallet.publicKey,
        ataTrove: userTroveTokenVaultKey,
        ataUserColl: userCollAddress,
        mintColl: mintCollKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      saberFarm: {
        quarry: quarryKey,
        miner: userMinerKey,
        minerVault: userMinerVaultKey,
      },
      saberFarmRewarder: SABER_REWARDER,
      saberFarmProgram: QUARRY_ADDRESSES.Mine,
    },
  });
  return txHash;
}

export async function harvestFromSaber(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey
  // userCollAddress: PublicKey
) {
  console.log('Harvesting from Saber');
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const sdk: QuarrySDK = QuarrySDK.load({
    provider: program.provider,
  });
  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);

  const [quarryKey] = await findQuarryAddress(SABER_REWARDER, mintCollKey);

  const [userMinerKey, userMinerBump] = await findMinerAddress(quarryKey, userTroveKey);

  const [userMinerVaultKey, userMinerVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  const [userTroveRewardKey, userTroveRewardNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), SABER_REWARD_MINT.toBuffer()],
    program.programId
  );
  const tx = new Transaction();

  let userRewardKey = await getOneFilteredTokenAccountsByOwner(connection, wallet.publicKey, SABER_REWARD_MINT);
  let amountOrigin = 0;
  if (userRewardKey === '') {
    const ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      SABER_REWARD_MINT,
      wallet.publicKey
    );

    userRewardKey = ata.toString();

    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        SABER_REWARD_MINT,
        new PublicKey(userRewardKey),
        wallet.publicKey,
        wallet.publicKey
      )
    );
  } else {
    const amount = await getTokenAmount(program.provider, userRewardKey);
    amountOrigin = amount.toNumber();
  }

  let feeCollectorKey = await getOneFilteredTokenAccountsByOwner(connection, FEE_OWNER, SABER_REWARD_MINT);
  if (feeCollectorKey === '') {
    const ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      SABER_REWARD_MINT,
      FEE_OWNER
    );

    feeCollectorKey = ata.toString();

    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        SABER_REWARD_MINT,
        new PublicKey(feeCollectorKey),
        wallet.publicKey,
        wallet.publicKey
      )
    );
  }

  const [minter] = await findMinterAddress(SABER_MINT_WRAPPER, SABER_REWARDER, QUARRY_ADDRESSES.MintWrapper);
  const ix = await program.instruction.harvestFromSaber({
    accounts: {
      ratioHarvester: {
        globalState: globalStateKey,
        vault: tokenVaultKey,
        trove: userTroveKey,

        authority: wallet.publicKey,

        troveReward: userTroveRewardKey,
        userRewardToken: userRewardKey,
        rewardFeeToken: feeCollectorKey,
        mintColl: mintCollKey,
        ...defaultAccounts,
      },
      saberFarm: {
        quarry: quarryKey,
        miner: userMinerKey,
        minerVault: userMinerVaultKey,
      },
      userTokenColl: userTroveTokenVaultKey,
      saberFarmRewarder: SABER_REWARDER,
      saberFarmProgram: QUARRY_ADDRESSES.Mine,

      mintWrapper: SABER_MINT_WRAPPER,
      mintWrapperProgram: QUARRY_ADDRESSES.MintWrapper,

      minter: minter,
      rewardsTokenMint: SABER_REWARD_MINT,
      claimFeeTokenAccount: rewarder.rewarderData.claimFeeTokenAccount,
    },
  });
  tx.add(ix);
  const txHash = await sendTransaction(connection, wallet, tx, []);
  console.log('Harvest finished', txHash);
  let amountNew = amountOrigin;
  while (amountNew === amountOrigin) {
    await serumCmn.sleep(200);
    const amountBn = await getTokenAmount(program.provider, userRewardKey);
    amountNew = amountBn.toNumber();
  }

  const rewardMint = await serumCmn.getMintInfo(program.provider, SABER_REWARD_MINT);
  const newReward = (amountNew - amountOrigin) * Math.pow(10, -rewardMint?.decimals);

  console.log('Reward Earned', newReward);

  return txHash;
}

export async function calculateReward(connection: Connection, wallet: any, mintCollKey: PublicKey) {
  const program = getProgramInstance(connection, wallet);

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const sdk: QuarrySDK = QuarrySDK.load({
    provider: program.provider,
  });
  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);

  const collMintInfo = await serumCmn.getMintInfo(program.provider, mintCollKey);

  const poolMintToken = SToken.fromMint(mintCollKey, collMintInfo.decimals);
  const quarry = await rewarder.getQuarry(poolMintToken);

  const miner = await quarry.getMiner(userTroveKey);
  const payroll = quarry.payroll;

  const currentTimeStamp = new anchor.BN(Math.ceil(new Date().getTime() / 1000));

  let expectedWagesEarned = 0;
  try {
    expectedWagesEarned = (
      await payroll.calculateRewardsEarned(
        currentTimeStamp,
        miner?.balance as anchor.BN,
        miner?.rewardsPerTokenPaid as anchor.BN,
        miner?.rewardsEarned as anchor.BN
      )
    ).toNumber();
  } catch (e) {
    // console.log(e);
  }
  // console.log(`Saber farming reward for  ${mintCollKey}`, expectedWagesEarned);
  return Math.ceil(expectedWagesEarned * Math.pow(10, -collMintInfo.decimals) * 100) / 100;
}

async function getTokenAmount(provider: any, tokenAccountKey: PublicKey | string) {
  const accountInfo = await serumCmn.getTokenAccount(provider, new PublicKey(tokenAccountKey));
  return accountInfo?.amount;
}

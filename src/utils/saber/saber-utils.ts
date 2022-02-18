import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as serumCmn from '@project-serum/common';
import BN from 'bn.js';

import {
  getProgramInstance,
  GLOBAL_STATE_TAG,
  PlatformType,
  TOKEN_VAULT_POOL_TAG,
  TOKEN_VAULT_TAG,
  TYPE_ID_SABER,
  USER_TROVE_POOL_TAG,
  USER_TROVE_TAG,
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
import { findMinerAddress, QuarrySDK, QUARRY_ADDRESSES } from '@quarryprotocol/quarry-sdk';
import { Token as SToken } from '@saberhq/token-utils';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { createAssociatedTokenAccount, findAssociatedTokenAddress } from '../raydium/web3';
import { getOneFilteredTokenAccountsByOwner, sendTransaction } from '../web3';
import { WalletAdapter } from '../../contexts/wallet';
import {
  FEE_OWNER,
  SABER_MINTER,
  SABER_MINT_WRAPPER,
  SABER_CLAIM_ACCOUNT,
  SABER_REWARDER,
  SABER_REWARD_MINT,
} from '../constant-test';

const defaultAccounts = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  systemProgram: SystemProgram.programId,
  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
};

const saberFarmQuarry = new anchor.web3.PublicKey('BTimzTk51pcKxDQLRR3iFs4dLVY9WyKgRBmnd1rZLN6n');

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
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  console.log('tokenVaultKey', tokenVaultKey.toBase58());

  try {
    await program.rpc.createTokenVault(
      tokenVaultNonce,
      riskLevel,
      0,
      new anchor.BN(100_000_000_000_000),
      TYPE_ID_SABER,
      {
        accounts: {
          authority: wallet.publicKey,
          tokenVault: tokenVaultKey,
          globalState: globalStateKey,
          mintColl: mintCollKey,
          ...defaultAccounts,
        },
      }
    );
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
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveRewardKey, userTroveRewardNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), SABER_REWARD_MINT.toBuffer()],
    program.programId
  );

  const ix1 = await program.instruction.createUserTrove(userTroveNonce, userTroveTokenVaultNonce, new anchor.BN(0), {
    accounts: {
      tokenVault: tokenVaultKey,
      userTrove: userTroveKey,
      authority: wallet.publicKey,

      tokenColl: userTroveTokenVaultKey,
      mintColl: mintCollKey,

      ...defaultAccounts,
    },
  });

  const ix2 = await program.instruction.createUserRewardVault(userTroveRewardNonce, {
    accounts: {
      authority: wallet.publicKey,
      userTrove: userTroveKey,
      tokenVault: tokenVaultKey,

      rewardVault: userTroveRewardKey,
      rewardMint: SABER_REWARD_MINT,

      ...defaultAccounts,
    },
  });

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

  const ix3 = await program.instruction.createQuarryMiner(userMinerBump, userMinerVaultBump, {
    accounts: {
      tokenVault: tokenVaultKey,
      userTrove: userTroveKey,
      payer: wallet.publicKey,
      miner: userMinerKey,
      quarry: saberFarmQuarry,
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
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
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
  const txHash = await program.rpc.depositToSaber(new anchor.BN(amount), {
    accounts: {
      ratioStaker: {
        globalState: globalStateKey,
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,
        owner: wallet.publicKey,
        poolTokenColl: userTroveTokenVaultKey,
        userTokenColl: userCollAddress,
        mintColl: mintCollKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      saberFarm: {
        quarry: saberFarmQuarry,
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
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
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
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,
        owner: wallet.publicKey,
        poolTokenColl: userTroveTokenVaultKey,
        userTokenColl: userCollAddress,
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
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey, userTroveTokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
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

  const [userTroveRewardKey, userTroveRewardNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), SABER_REWARD_MINT.toBuffer()],
    program.programId
  );
  const tx = new Transaction();

  let userRewardKey = await getOneFilteredTokenAccountsByOwner(connection, wallet.publicKey, SABER_REWARD_MINT);

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

  const ix = await program.instruction.harvestFromSaber({
    accounts: {
      ratioHarvester: {
        globalState: globalStateKey,
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,

        authority: wallet.publicKey,

        userTroveReward: userTroveRewardKey,
        userRewardToken: userRewardKey,
        rewardFeeToken: feeCollectorKey,
        collateralMint: mintCollKey,
        ...defaultAccounts,
      },
      saberFarm: {
        quarry: saberFarmQuarry,
        miner: userMinerKey,
        minerVault: userMinerVaultKey,
      },
      userTokenColl: userTroveTokenVaultKey,
      saberFarmRewarder: SABER_REWARDER,
      saberFarmProgram: QUARRY_ADDRESSES.Mine,

      mintWrapper: SABER_MINT_WRAPPER,
      mintWrapperProgram: QUARRY_ADDRESSES.MintWrapper,

      minter: SABER_MINTER,
      rewardsTokenMint: SABER_REWARD_MINT,
      claimFeeTokenAccount: SABER_CLAIM_ACCOUNT,
    },
  });
  tx.add(ix);
  const txHash = await sendTransaction(connection, wallet, tx, []);

  return txHash;
}

export async function calculateReward(connection: Connection, wallet: any, mintCollKey: PublicKey) {
  const program = getProgramInstance(connection, wallet);

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
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

  const expectedWagesEarned = payroll.calculateRewardsEarned(
    currentTimeStamp,
    miner?.balance as anchor.BN,
    miner?.rewardsPerTokenPaid as anchor.BN,
    miner?.rewardsEarned as anchor.BN
  );
  console.log('Saber farming', expectedWagesEarned.toString());
  return Math.ceil(parseFloat(expectedWagesEarned.toString()) * Math.pow(10, -collMintInfo.decimals) * 100) / 100;
}

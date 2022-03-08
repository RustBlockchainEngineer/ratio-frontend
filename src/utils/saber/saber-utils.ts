import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as serumCmn from '@project-serum/common';

import {
  getProgramInstance,
  GLOBAL_STATE_TAG,
  VAULT_SEED,
  TYPE_ID_SABER,
  TROVE_POOL_SEED,
  TROVE_SEED,
  WSOL_MINT_KEY,
  PRICE_FEED_TAG,
  getUserState,
} from '../ratio-lending';
import { PublicKey, SystemProgram, Transaction, Connection } from '@solana/web3.js';
import {
  findMinerAddress,
  findMinterAddress,
  findQuarryAddress,
  QuarrySDK,
  QUARRY_ADDRESSES,
} from '@quarryprotocol/quarry-sdk';
import { Token as SToken } from '@saberhq/token-utils';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { getOneFilteredTokenAccountsByOwner, sendTransaction } from '../web3';
import { SABER_MINT_WRAPPER, SABER_REWARDER, SABER_REWARD_MINT } from './constants';
import { WalletAdapter } from '../../contexts/wallet';
import { TokenAmount } from '../safe-math';

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
  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  console.log('tokenVaultKey', tokenVaultKey.toBase58());

  try {
    const [priceFeedKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(PRICE_FEED_TAG), mintCollKey.toBuffer()],
      program.programId
    );
    // todo - get real tokenA, B, C
    // FIXME: hardcoded
    const mintA = new PublicKey('7KLQxufDu9H7BEAHvthC5p4Uk6WrH3aw8TwvPXoLgG11');
    const mintB = new PublicKey('BicnAQ4jQgz3g7htuq1y6SKUNtrTr7UmpQjCqnTKkHR5');
    const mintC = new PublicKey('FnjuEcDDTL3e511XE5a7McbDZvv2sVfNfEjyq4fJWXxg');
    const vaultA = new PublicKey('F8kPn8khukSVp4xwvHGiWUc6RnCScFbACdXJmyEaWWxX');
    const vaultB = new PublicKey('3ZFPekrEr18xfPMUFZDnyD6ZPrKGB539BzM8uRFmwmBa');
    const vaultC = new PublicKey('435X8hbABi3xGzBTqAZ2ehphwibk4dQrjRFSXE7uqvrc');
    const pairCount = 2;

    const ix1 = program.instruction.createVault(
      tokenVaultNonce,
      riskLevel,
      0,
      new anchor.BN(100_000_000_000_000),
      TYPE_ID_SABER,
      {
        accounts: {
          authority: wallet.publicKey,
          vault: tokenVaultKey,
          globalState: globalStateKey,
          mintColl: mintCollKey,
          ...defaultAccounts,
        },
      }
    );
    const ix2 = program.instruction.createPriceFeed(pairCount, {
      accounts: {
        authority: wallet.publicKey,
        globalState: globalStateKey,
        vault: tokenVaultKey,
        priceFeed: priceFeedKey,
        mintColl: mintCollKey,
        mintA,
        mintB,
        mintC,
        vaultA,
        vaultB,
        vaultC,
        ...defaultAccounts,
      },
    });
    const transaction = new Transaction();
    transaction.add(...[ix1, ix2]);

    const txHash = await sendTransaction(connection, wallet, transaction, []);
    console.log(`vault created. txHash = ${txHash}`);
    return 'created token vault successfully';
  } catch (e) {
    console.log("can't create token vault");
    console.log('program:', program);
    console.error(e);
  }
}
export async function createSaberUserTrove(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey,
  needTx = false
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  console.log('Create Saber UserTrove');

  const program = getProgramInstance(connection, wallet);

  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
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

  const ix1 = await program.instruction.createTrove(userTroveNonce, userTroveTokenVaultNonce, {
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
  });

  const transaction = new Transaction();
  transaction.add(...[ix1, ix2, ix3]);
  if (needTx) {
    return transaction;
  } else {
    const txHash = await sendTransaction(connection, wallet, transaction, []);

    return txHash;
  }
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
  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const [quarryKey] = await findQuarryAddress(SABER_REWARDER, mintCollKey);

  const [userMinerKey] = await findMinerAddress(quarryKey, userTroveKey);

  const [userMinerVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const transaction = new Transaction();

  const user = await getUserState(connection, wallet, mintCollKey);
  if (!user) {
    const tx = await createSaberUserTrove(connection, wallet, mintCollKey, true);
    transaction.add(tx);
  }

  const ix = await program.instruction.depositToSaber(new anchor.BN(amount), {
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
  transaction.add(ix);
  const txHash = await sendTransaction(connection, wallet, transaction);
  console.log('Saber deposit tx', txHash);
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
  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  const sdk: QuarrySDK = QuarrySDK.load({
    provider: program.provider,
  });
  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);

  const quarryKey = await rewarder.getQuarryKeyForMint(mintCollKey);

  const [userMinerKey] = await findMinerAddress(quarryKey, userTroveKey);

  const [userMinerVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const transaction = new Transaction();

  const ix = await program.instruction.withdrawFromSaber(new anchor.BN(amount), {
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
  transaction.add(ix);

  const harvest_ix = await harvestFromSaber(connection, wallet, mintCollKey, true);
  transaction.add(harvest_ix);

  const txHash = await sendTransaction(connection, wallet, transaction);
  console.log('Saber withdraw tx', txHash);

  return txHash;
}

export async function harvestFromSaber(connection: Connection, wallet: any, mintCollKey: PublicKey, needTx = false) {
  console.log('Harvesting from Saber');
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const globalState = await program.account.globalState.fetch(globalStateKey);
  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_SEED), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  const [userTroveTokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );
  const sdk: QuarrySDK = QuarrySDK.load({
    provider: program.provider,
  });
  const rewarder = await sdk.mine.loadRewarderWrapper(SABER_REWARDER);

  const [quarryKey] = await findQuarryAddress(SABER_REWARDER, mintCollKey);

  const [userMinerKey] = await findMinerAddress(quarryKey, userTroveKey);

  const [userMinerVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  const [userTroveRewardKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TROVE_POOL_SEED), userTroveKey.toBuffer(), SABER_REWARD_MINT.toBuffer()],
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

  let feeCollectorKey = await getOneFilteredTokenAccountsByOwner(connection, globalState.treasury, SABER_REWARD_MINT);
  if (feeCollectorKey === '') {
    const ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      SABER_REWARD_MINT,
      globalState.treasury
    );

    feeCollectorKey = ata.toString();

    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        SABER_REWARD_MINT,
        new PublicKey(feeCollectorKey),
        globalState.treasury,
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
      ataUserColl: userTroveTokenVaultKey,
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

  if (needTx === false) {
    const txHash = await sendTransaction(connection, wallet, tx);
    console.log('Harvest finished', txHash);
    return txHash;
  } else {
    return tx;
  }
}

export async function calculateSaberReward(connection: Connection, wallet: any, mintCollKey: PublicKey) {
  try {
    const program = getProgramInstance(connection, wallet);

    const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(VAULT_SEED), mintCollKey.toBuffer()],
      program.programId
    );
    const [userTroveKey] = await anchor.web3.PublicKey.findProgramAddress(
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

    const expectedWagesEarned = (
      await payroll.calculateRewardsEarned(
        currentTimeStamp,
        miner?.balance as anchor.BN,
        miner?.rewardsPerTokenPaid as anchor.BN,
        miner?.rewardsEarned as anchor.BN
      )
    ).toNumber();
    return parseFloat(new TokenAmount(expectedWagesEarned, collMintInfo.decimals).fixed());
  } catch (e) {
    console.log(e);
    return 0;
  }
}

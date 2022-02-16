import * as anchor from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as serumCmn from '@project-serum/common';

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
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { createAssociatedTokenAccount, findAssociatedTokenAddress } from '../raydium/web3';
import { getOneFilteredTokenAccountsByOwner, sendTransaction } from '../web3';

const defaultAccounts = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
  systemProgram: SystemProgram.programId,
  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
};

const FEE_OWNER = new anchor.web3.PublicKey('2Pv5mjmKYAtXNpr3mcsXf7HjtS3fieJeFoWPATVT5rWa');

const saberRewardMint = new anchor.web3.PublicKey('5thfi9cDKV9BLvgVPd6f5F984tAsGAk4yJzTng8wn891');
const mintWrapperKey = new anchor.web3.PublicKey('Da6B5yuX2nSnmMq6rhxW2mVCpXkCiU9GrqbRenzR4jtX');
const minter = new anchor.web3.PublicKey('FZwq3nguZdiKjDEjkNR8cdLah9xt5Fp1xkHb6Cj6HPNY');

const rewarderClaimFeeTokenAccount = new anchor.web3.PublicKey('6SKxs5sGrhwoXiTFD7XK3ZCjFZmLoKD15kP8nA5yfxHL');

const saberFarmQuarry = new anchor.web3.PublicKey('BTimzTk51pcKxDQLRR3iFs4dLVY9WyKgRBmnd1rZLN6n');
const saberFarmRewarder = new anchor.web3.PublicKey('CfmVBs4jbNQNtNMn5iHkA4upHBUVuTqAkpGqRV3k4hRh');

export async function createSaberTokenVault(
  connection: Connection,
  wallet: any,
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
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), saberRewardMint.toBuffer()],
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
      rewardMint: saberRewardMint,

      ...defaultAccounts,
    },
  });

  const [userMinerKey, userMinerBump] = await findMinerAddress(saberFarmQuarry, userTroveKey);

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
      rewarder: saberFarmRewarder,
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
  const [userMinerKey, userMinerBump] = await findMinerAddress(saberFarmQuarry, userTroveKey);

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
      saberFarmRewarder,
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
  const [userMinerKey, userMinerBump] = await findMinerAddress(saberFarmQuarry, userTroveKey);

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
        quarry: saberFarmQuarry,
        miner: userMinerKey,
        minerVault: userMinerVaultKey,
      },
      saberFarmRewarder,
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
  {
    const tx = new Transaction();

    const mint = new PublicKey('2y3JStod54SRoPC6a9LvAb7iRz4cjbF1N4eNeXsHCKhS');
    const owner = new PublicKey('HH8CQZbhwfza8ZjXcfsnrykKXoE61vcQdvyL2uN9HDV6');
    const ata = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint, owner);
    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        ata,
        owner,
        wallet.publicKey
      )
    );
    tx.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        new PublicKey('5FV9gJqPXcSKw4KfmCXcHASMDcwwzEFn3MQQro8gUG5b'),
        ata,
        wallet.publicKey,
        [],
        10 * Math.pow(10, 6)
      )
    );
    const txHash = await sendTransaction(connection, wallet, tx, []);

    return txHash;
  }

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
  const [userMinerKey, userMinerBump] = await findMinerAddress(saberFarmQuarry, userTroveKey);

  const [userMinerVaultKey, userMinerVaultBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('Miner-Vault'), userMinerKey.toBuffer(), mintCollKey.toBuffer()],
    program.programId
  );

  const [userTroveRewardKey, userTroveRewardNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_POOL_TAG), userTroveKey.toBuffer(), saberRewardMint.toBuffer()],
    program.programId
  );
  const tx = new Transaction();

  let userRewardKey = await getOneFilteredTokenAccountsByOwner(connection, wallet.publicKey, saberRewardMint);

  if (userRewardKey === '') {
    const ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      saberRewardMint,
      wallet.publicKey
    );

    userRewardKey = ata.toString();

    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        saberRewardMint,
        new PublicKey(userRewardKey),
        wallet.publicKey,
        wallet.publicKey
      )
    );
  }

  let feeCollectorKey = await getOneFilteredTokenAccountsByOwner(connection, FEE_OWNER, saberRewardMint);
  if (feeCollectorKey === '') {
    const ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      saberRewardMint,
      FEE_OWNER
    );

    feeCollectorKey = ata.toString();

    tx.add(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        saberRewardMint,
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
      saberFarmRewarder,
      saberFarmProgram: QUARRY_ADDRESSES.Mine,

      mintWrapper: mintWrapperKey,
      mintWrapperProgram: QUARRY_ADDRESSES.MintWrapper,

      minter,
      rewardsTokenMint: saberRewardMint,
      claimFeeTokenAccount: rewarderClaimFeeTokenAccount,
    },
  });
  tx.add(ix);
  const txHash = await sendTransaction(connection, wallet, tx, []);

  return txHash;
}

async function getTokenAmount(account: PublicKey) {
  const { amount } = await serumCmn.getTokenAccount(anchor.getProvider(), account);
  return amount;
}

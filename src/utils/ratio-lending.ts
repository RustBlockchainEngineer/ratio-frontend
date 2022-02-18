/* eslint-disable prettier/prettier */
import idl from './ratio-lending-idl.json';

import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
const { BN } = anchor;
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import {
  checkWalletATA,
  createAssociatedTokenAccountIfNotExist,
  createTokenAccountIfNotExist,
  sendTransaction,
} from './web3';
import { closeAccount } from '@project-serum/serum/lib/token-instructions';
import { STABLE_POOL_PROGRAM_ID } from './ids';
import { getTokenBySymbol } from './tokens';
import usdrIcon from '../assets/images/USDr.png';
import { sleep } from './utils';
import { createSaberTokenVault } from './saber/saber-utils';

export declare type PlatformType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const TYPE_ID_RAYDIUM: PlatformType = 0;
export const TYPE_ID_ORCA: PlatformType = 1;
export const TYPE_ID_SABER: PlatformType = 0;
export const TYPE_ID_MERCURIAL: PlatformType = 3;
export const TYPE_ID_UNKNOWN: PlatformType = 4;

export const WSOL_MINT_KEY = new PublicKey('So11111111111111111111111111111111111111112');

export const USDR_MINT_KEY = 'GHY2oA1hsLn8qYFZDz9GFy4hSUwtdVfkcSkhKHYr7XKd';
export const GLOBAL_STATE_TAG = 'global-state-seed';
export const TOKEN_VAULT_TAG = 'token-vault-seed';
export const USER_TROVE_TAG = 'user-trove';
export const USD_MINT_TAG = 'usd-mint';
export const USER_USD_TOKEN_TAG = 'usd-token';
export const TOKEN_VAULT_POOL_TAG = 'token-vault-pool';
export const USER_TROVE_POOL_TAG = 'user-trove-pool';

export const STABLE_POOL_IDL = idl;
export const USD_DECIMALS = 6;
export const defaultPrograms = {
  systemProgram: SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  rent: SYSVAR_RENT_PUBKEY,
  clock: SYSVAR_CLOCK_PUBKEY,
};

const GLOBAL_TVL_LIMIT = 1_000_000_000;
const GLOBAL_DEBT_CEILING = 15_000_000;

export const TOKEN_VAULT_OPTIONS = [
  {
    value: 'USDC-CASH',
    label: 'USDC-CASH LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/FZE52MWasDcwNeQfBL6PUHjvYgQMthvHNX5e7xUDN56T/logo.png`,
    ],
    mintAddress: 'FZE52MWasDcwNeQfBL6PUHjvYgQMthvHNX5e7xUDN56T',
  },
  {
    value: 'USDC-PAI',
    label: 'USDC-PAI LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7gJWEW3vGDgUNbg3agG9DSSkb271tpk82K4ixAGXeuoh/logo.png`,
    ],
    mintAddress: '7gJWEW3vGDgUNbg3agG9DSSkb271tpk82K4ixAGXeuoh',
  },
  {
    value: 'USDC-USDT',
    label: 'USDC-USDT LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HXb1AM83cRUbGegTivuSanvLP1W8A4pyTGMveNWR1pyg/logo.png`,
    ],
    mintAddress: 'HXb1AM83cRUbGegTivuSanvLP1W8A4pyTGMveNWR1pyg',
  },
  {
    value: 'USDT-CASH',
    label: 'USDT-CASH LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9RBrjJLKK7xm5275iNHPDdtMEN3nZFhPDiUkZGmkTUrd/logo.png`,
    ],
    mintAddress: '9RBrjJLKK7xm5275iNHPDdtMEN3nZFhPDiUkZGmkTUrd',
  },
];

// This command makes an Lottery
export function getProgramInstance(connection: Connection, wallet: any) {
  // if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.Provider(connection, wallet, anchor.Provider.defaultOptions());
  // Read the generated IDL.
  const idl = STABLE_POOL_IDL as any;

  // Address of the deployed program.
  const programId = STABLE_POOL_PROGRAM_ID;

  // Generate the program client from IDL.
  const program = new (anchor as any).Program(idl, programId, provider);

  return program;
}

async function retrieveGlobalState(connection: Connection, wallet: any) {
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const globalState = await program.account.globalState.fetch(globalStateKey);
  return { globalState, globalStateKey };
}

export async function getGlobalState(connection: Connection, wallet: any) {
  try {
    const { globalState, globalStateKey } = await retrieveGlobalState(connection,wallet);
    if (globalState) {
      return { globalState, globalStateKey };
    } else {
      throw new Error(`Global state doesn't exist`);
    }
  } catch (e) {
    console.log('globalState was not created');
    throw e;
  }
}

export async function getCurrentSuperOwner(connection: Connection, wallet: any): Promise<PublicKey> {
  try {
    const { globalState } = await getGlobalState(connection, wallet);
    return globalState.authority;
  } catch (e) {
    console.error('Error while fetching the super owner');
    throw e;
  }
}

export async function isGlobalStateCreated(connection: Connection, wallet: any) {
  try {
    const globalState = await retrieveGlobalState(connection,wallet);
    if (globalState) {
      return true;
    }
    return false;
  } catch (e) {
    console.log('globalState was not created');
    return false;
  }
}

// This command makes an Lottery
export async function createGlobalState(connection: Connection, wallet: any) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  console.log('globalStateKey', globalStateKey.toBase58());
  const [mintUsdKey, mintUsdNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_MINT_TAG)],
    program.programId
  );
  console.log('mintUsdKey', mintUsdKey.toBase58());
  try {
    const globalState = await program.account.globalState.fetch(globalStateKey);
    console.log('already created');
    console.log('globalState', globalState);
    return 'already created';
  } catch (e) {
    console.log("Global state didn't exist");
  }
  try {
    await program.rpc.createGlobalState(
      globalStateNonce,
      mintUsdNonce,
      new anchor.BN(GLOBAL_TVL_LIMIT),
      new anchor.BN(GLOBAL_DEBT_CEILING),
      {
        accounts: {
          authority: wallet.publicKey,
          globalState: globalStateKey,
          mintUsd: mintUsdKey,
          ...defaultPrograms,
        },
      }
    );
  } catch (e) {
    console.log("can't create global state");
    console.error(e);
  }
  return 'created global state';
}

export async function getUserState(connection: Connection, wallet: any, mintCollKey: PublicKey = WSOL_MINT_KEY) {
  const program = getProgramInstance(connection, wallet);
  
  const tokenVaultKey = await getTokenVaultAddressByPublicKeyMint(connection, mintCollKey);
  if(!tokenVaultKey){
    return null;
  }
  const [userTroveKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  try {
    return await program.account.userTrove.fetch(userTroveKey);
  } catch (e) {
    return null;
  }
}

export async function getUserOverview(connection: Connection, wallet: any, mints: string[]) {
  const activeVaults: any = {};
  let vaultCount = 0;
  let totalDebt = 0;
  for (let i = 0; i < mints.length; i++) {
    const state = await getUserState(connection, wallet, new PublicKey(mints[i]));
    if (state && state.lockedCollBalance.toString() !== '0') {
      activeVaults[mints[i]] = {
        mint: mints[i],
        lockedAmount: Number(state.lockedCollBalance.toString()),
        debt: Number(state.debt.toString()),
      };
      vaultCount++;
      totalDebt += Number(state.debt.toString());
    }
  }
  return {
    activeVaults,
    totalDebt,
    vaultCount,
  };
}

export async function getUpdatedUserState(connection: any, wallet: any, mint: string, originState: any) {
  let res = null;
  do {
    await sleep(300);
    res = await getUserState(connection, wallet, new PublicKey(mint));
  } while (
    !res ||
    (originState &&
      res.lockedCollBalance.toString() === originState.lockedCollBalance.toString() &&
      res.debt.toString() === (originState as any).debt.toString())
  );

  return res;
}

export async function borrowUSDr(
  connection: Connection,
  wallet: any,
  amount: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

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
  const [mintUsdKey, mintUsdNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_MINT_TAG)],
    program.programId
  );

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  const [userUsdKey, userUsdKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_USD_TOKEN_TAG), wallet.publicKey.toBuffer(), mintUsdKey.toBuffer()],
    program.programId
  );

  const borrowInstruction = await program.instruction.borrowUsd(
    new anchor.BN(amount),
    userUsdKeyNonce,
    {
      accounts: {
        owner: wallet.publicKey,
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,
        globalState: globalStateKey,
        mintUsd: mintUsdKey,
        userTokenUsd: userUsdKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    }
  );

  transaction.add(borrowInstruction);

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User borrowed ' + amount / Math.pow(10, USD_DECIMALS) + ' USD , transaction id = ' + tx;
}


export async function getTokenVaultAndAddressByPublicKeyMint(connection: Connection, mint: PublicKey) {
  const program = getProgramInstance(connection, null);
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mint.toBuffer()],
    program.programId
  );
  try {
    const tokenVault = await program.account.tokenVault.fetch(tokenVaultKey);
    return {tokenVault,tokenVaultKey};
  } catch (e) {
    return null;
  }
}
export async function getTokenVaultAndAddressByMint(connection: Connection, mint: string) {
  return getTokenVaultAndAddressByPublicKeyMint(connection, new PublicKey(mint));
}

export async function getTokenVaultByMint(connection: Connection, mint: string): Promise<any|undefined> {
  const res = await getTokenVaultAndAddressByMint(connection,mint);
  return res?.tokenVault;
}

export async function getTokenVaultAddressByMint(connection: Connection, mint: string) : Promise<PublicKey|undefined> {
  const res = await getTokenVaultAndAddressByMint(connection,mint);
  return res?.tokenVaultKey;
}

export async function getTokenVaultAddressByPublicKeyMint(connection: Connection, mint: PublicKey) : Promise<PublicKey|undefined> {
  const res = await getTokenVaultAndAddressByPublicKeyMint(connection,mint);
  return res?.tokenVaultKey;
}

export async function createTokenVault(
  connection: Connection,
  wallet: any,
  mintCollKey: PublicKey = WSOL_MINT_KEY,
  riskLevel = 0,
  platform = "SABER",
) {
  try {
    switch (platform) {
      case "SABER":
        return await createSaberTokenVault(connection, wallet, mintCollKey, riskLevel);
      default:
        console.error('Platform vault creation yet not implemented');
        break;
    }
  } catch (e) {
    console.log("can't create token vault");
  }
}

export async function createUserTrove(connection: Connection, wallet: any, mintCollKey: PublicKey = WSOL_MINT_KEY) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
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

  try {
    const userTrove = await program.account.userTrove.fetch(userTroveKey);
    console.log('fetched userTrove', userTrove);
    console.log('This user trove was already created!');
    return 'already created!';
  } catch (e) {}

  try {
    await program.rpc.createUserTrove(userTroveNonce, userTroveTokenVaultNonce, new BN(0), {
      accounts: {
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,

        authority: wallet.publicKey,

        tokenColl: userTroveTokenVaultKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    });
  } catch (e) {
    console.log("can't create user trove");
  }
  return 'created user trove successfully!';
}

export async function depositCollateral(
  connection: Connection,
  wallet: any,
  amount: number,
  userCollAddress: string | null = null,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [tokenCollKey, tokenCollNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_POOL_TAG), tokenVaultKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  let userCollKey = null;

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  userCollKey = await createTokenAccountIfNotExist(
    program.provider.connection,
    userCollAddress,
    wallet.publicKey,
    mintCollKey.toBase58(),
    accountRentExempt,
    transaction,
    signers
  );

  try {
    await program.account.userTrove.fetch(userTroveKey);
  } catch {
    const tx = await program.instruction.createUserTrove(userTroveNonce, tokenVaultNonce, {
      accounts: {
        troveOwner: wallet.publicKey,
        userTrove: userTroveKey,
        tokenVault: tokenVaultKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    });
    transaction.add(tx);
  }

  const depositInstruction = await program.instruction.depositCollateral(
    new anchor.BN(amount),
    tokenVaultNonce,
    userTroveNonce,
    tokenCollNonce,
    {
      accounts: {
        owner: wallet.publicKey,
        userTrove: userTroveKey,
        tokenVault: tokenVaultKey,
        poolTokenColl: tokenCollKey,
        userTokenColl: userCollKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    }
  );

  transaction.add(depositInstruction);

  if (mintCollKey.toBase58() === WSOL_MINT_KEY.toBase58()) {
    transaction.add(
      closeAccount({
        source: userCollKey,
        destination: wallet.publicKey,
        owner: wallet.publicKey,
      })
    );
  }

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User deposited ' + amount / Math.pow(10, 9) + ' SOL, transaction id = ' + tx;
}

export async function lockAndMint(
  connection: Connection,
  wallet: any,
  amountDeposit: number,
  amountMint: number,
  userCollAddress: string | null = null,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
/*
  const program = getProgramInstance(connection, wallet);

  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [tokenCollKey, tokenCollNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_POOL_TAG), tokenVaultKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const [mintUsdKey, mintUsdNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_MINT_TAG)],
    program.programId
  );

  const [userUsdKey, userUsdKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_USD_TOKEN_TAG), wallet.publicKey.toBuffer(), mintUsdKey.toBuffer()],
    program.programId
  );

  const transaction = new Transaction();
  const signers: Keypair[] = [];

  let userCollKey = null;

  const accountRentExempt = await connection.getMinimumBalanceForRentExemption(AccountLayout.span);

  userCollKey = await createTokenAccountIfNotExist(
    program.provider.connection,
    userCollAddress,
    wallet.publicKey,
    mintCollKey.toBase58(),
    accountRentExempt,
    transaction,
    signers
  );

  try {
    await program.account.userTrove.fetch(userTroveKey);
  } catch {
    const tx = await program.instruction.createUserTrove(userTroveNonce, tokenVaultNonce, {
      accounts: {
        troveOwner: wallet.publicKey,
        userTrove: userTroveKey,
        tokenVault: tokenVaultKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    });
    transaction.add(tx);
  }

  const depositInstruction = await program.instruction.depositCollateral(
    new anchor.BN(amountDeposit),
    tokenVaultNonce,
    userTroveNonce,
    tokenCollNonce,
    {
      accounts: {
        owner: wallet.publicKey,
        userTrove: userTroveKey,
        tokenVault: tokenVaultKey,
        poolTokenColl: tokenCollKey,
        userTokenColl: userCollKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    }
  );
  transaction.add(depositInstruction);

  const borrowInstruction = await program.instruction.borrowUsd(
    new anchor.BN(amountMint),
    tokenVaultNonce,
    userTroveNonce,
    globalStateNonce,
    mintUsdNonce,
    userUsdKeyNonce,
    {
      accounts: {
        owner: wallet.publicKey,
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,
        globalState: globalStateKey,
        mintUsd: mintUsdKey,
        userTokenUsd: userUsdKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    }
  );
  transaction.add(borrowInstruction);

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('txid', tx);
  */
}

export async function getUsdrMintKey(connection: Connection, wallet: any) {
  const program = getProgramInstance(connection, null);

  const [mintUsdKey] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from(USD_MINT_TAG)], program.programId);
  return mintUsdKey.toBase58();
}

export async function repayUSDr(
  connection: Connection,
  wallet: any,
  amount: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

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
  const [mintUsdKey, mintUsdNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USD_MINT_TAG)],
    program.programId
  );

  const transaction = new Transaction();
  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  const [userUsdKey, userUsdKeyNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_USD_TOKEN_TAG), wallet.publicKey.toBuffer(), mintUsdKey.toBuffer()],
    program.programId
  );

  const repayInstruction = await program.instruction.repayUsd(
    new anchor.BN(amount),
    {
      accounts: {
        owner: wallet.publicKey,
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,
        globalState: globalStateKey,
        mintUsd: mintUsdKey,
        userTokenUsd: userUsdKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    }
  );
  instructions.push(repayInstruction);

  instructions.forEach((instruction) => {
    transaction.add(instruction);
  });

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User repaid ' + amount / Math.pow(10, USD_DECIMALS) + ' USD , transaction id = ' + tx;
}

export async function withdrawCollateral(
  connection: Connection,
  wallet: any,
  amount: number,
  userCollAddress: string | null = null,
  mintCollKey: PublicKey = WSOL_MINT_KEY
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [globalStateKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const globalState = await program.account.globalState.fetch(globalStateKey);
  console.log('fetched globalState', globalState);

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [tokenCollKey, tokenCollNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_POOL_TAG), tokenVaultKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );

  const transaction = new Transaction();
  const instructions: TransactionInstruction[] = [];
  const signers: Keypair[] = [];

  let userCollKey = null;

  userCollKey = await createTokenAccountIfNotExist(
    program.provider.connection,
    userCollAddress,
    wallet.publicKey,
    mintCollKey.toBase58(),
    null,
    transaction,
    signers
  );

  const withdrawInstruction = await program.instruction.withdrawCollateral(
    new anchor.BN(amount),
    {
      accounts: {
        owner: wallet.publicKey,
        globalState: globalStateKey,
        userTrove: userTroveKey,
        tokenVault: tokenVaultKey,
        poolTokenColl: tokenCollKey,
        userTokenColl: userCollKey,
        mintColl: mintCollKey,
        ...defaultPrograms,
      },
    }
  );
  instructions.push(withdrawInstruction);

  if (mintCollKey.toBase58() === WSOL_MINT_KEY.toBase58()) {
    instructions.push(
      closeAccount({
        source: userCollKey,
        destination: wallet.publicKey,
        owner: wallet.publicKey,
      })
    );
  }
  instructions.forEach((instruction) => {
    transaction.add(instruction);
  });

  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);

  return 'User withdrawed ' + amount / Math.pow(10, 9) + ' SOL, transaction id = ' + tx;
}
export async function setVaultDebtCeiling(
  connection: Connection,
  wallet: any,
  vaultDebtCeiling: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY,
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.setVaultDebtCeiling(
    new anchor.BN(vaultDebtCeiling),
    {
      accounts: {
        payer: wallet.publicKey,
        globalState: globalStateKey,
        mintColl: mintCollKey,
        tokenVault: tokenVaultKey,
      },
    }
  );
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
  return 'Set Vault Debt Ceiling to' + vaultDebtCeiling + ', transaction id = ' + tx;
}

export async function setGloalTvlLimit(
  connection: Connection,
  wallet: any,
  newTvlLimit: number
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.setGloalTvlLimit(
    new anchor.BN(newTvlLimit),
    {
      accounts: {
        payer: wallet.publicKey,
        globalState: globalStateKey
      },
    }
  );
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
  return 'Set Global TVL Limit to' + newTvlLimit + ', transaction id = ' + tx;
}

export async function setUserDebtCeiling(
  connection: Connection,
  wallet: any,
  userPk: PublicKey,
  newDebtCeiling: number,
  mintCollKey: PublicKey = WSOL_MINT_KEY,
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), userPk.toBuffer()],
    program.programId
  );
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.setUserDebtCeiling(
    new anchor.BN(newDebtCeiling),
    {
      accounts: {
        payer: wallet.publicKey,
        user: userPk,
        globalState: globalStateKey,
        mintColl: mintCollKey,
        tokenVault: tokenVaultKey,
        userTrove: userTroveKey,
      },
    }
  );
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
  return 'Set User Debt Ceiling to' + newDebtCeiling + ', transaction id = ' + tx;
}
export async function toggleEmergencyState(
  connection: Connection,
  wallet: any,
  paused: number
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();
  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.toggleEmerState(
    paused,
    {
      accounts: {
        payer: wallet.publicKey,
        globalState: globalStateKey
      },
    }
  );
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
  return 'Set EmergencyState to' + paused?'Paused':'Resumed' + ', transaction id = ' + tx;
}

export async function changeSuperOwner(
  connection: Connection,
  wallet: any,
  newOwner: PublicKey
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);
  const [globalStateKey, globalStateNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_STATE_TAG)],
    program.programId
  );
  const transaction = new Transaction();
  const signers: Keypair[] = [];
  const ix = await program.instruction.changeSuperOwner(
    {
      accounts: {
        payer: wallet.publicKey,
        globalState: globalStateKey,
        newOwner
      },
    }
  );
  transaction.add(ix);
  const tx = await sendTransaction(connection, wallet, transaction, signers);
  console.log('tx id->', tx);
  return 'Set Super Owner to' + newOwner.toBase58() + ', transaction id = ' + tx;
}
/* eslint-disable prettier/prettier */
import idl from './ratio-lending-idl.json';

import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
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

export const WSOL_MINT_KEY = new PublicKey('So11111111111111111111111111111111111111112');

export const USDR_MINT_KEY = 'GHY2oA1hsLn8qYFZDz9GFy4hSUwtdVfkcSkhKHYr7XKd';
export const GLOBAL_STATE_TAG = 'golbal-state-seed';
export const TOKEN_VAULT_TAG = 'token-vault-seed';
export const USER_TROVE_TAG = 'user-trove-seed';
export const USD_MINT_TAG = 'usd-mint';
export const USER_USD_TOKEN_TAG = 'usd-token';
export const TOKEN_VAULT_POOL_TAG = 'token-vault-pool';

export const STABLE_POOL_IDL = idl;
export const USD_DECIMALS = 6;
const defaultPrograms = {
  systemProgram: SystemProgram.programId,
  tokenProgram: TOKEN_PROGRAM_ID,
  rent: SYSVAR_RENT_PUBKEY,
  clock: SYSVAR_CLOCK_PUBKEY,
};

export const TOKEN_VAULT_OPTIONS = [
  {
    value: 'wtUST-USDC',
    label: 'wtUST-USDC LP',
    icon: [`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/6rJSjCEVxovip8GBUw6P7tsQprzFPET3uTohCXXQqkBh/logo.png`],
    mintAddress: '6rJSjCEVxovip8GBUw6P7tsQprzFPET3uTohCXXQqkBh',
  },
  {
    value: 'USDC-USDT',
    label: 'USDC-USDT LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BkpqyoDe5mwN6DiH1MYSJ1G4AbhPuiZsycjjYfQcWK9P/logo.png`,
    ],
    mintAddress: 'BkpqyoDe5mwN6DiH1MYSJ1G4AbhPuiZsycjjYfQcWK9P',
  },
  {
    value: 'wUST-USDC-USDT',
    label: 'UST-3Pool LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ASnVcQxNRosGw8crN8E4ScnDncBfnR1eJPyzucKsM4Vm/logo.png`,
    ],
    mintAddress: 'ASnVcQxNRosGw8crN8E4ScnDncBfnR1eJPyzucKsM4Vm',
  },
  {
    value: 'USDC-CASH',
    label: 'USDC-CASH LP',
    icon: [
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2gsojBCyZUgqXEj5vR41sKat3JyG11nXSsgzMErY9EVL/logo.png`,
    ],
    mintAddress: '2gsojBCyZUgqXEj5vR41sKat3JyG11nXSsgzMErY9EVL',
  },
];

// This command makes an Lottery
function getProgramInstance(connection: Connection, wallet: any) {
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
  return globalState
}

export async function getGlobalState(connection: Connection, wallet: any) {
  try {
    const globalState = await retrieveGlobalState(connection,wallet);
    if (globalState) {
      return globalState;
    } else {
      throw new Error (`Global state doesn't exist`)
    }
  } catch (e) {
    console.log('globalState was not created');
    throw e;
  }
}

export async function getCurrentSuperOwner(connection: Connection, wallet: any) : Promise<PublicKey> {
  try {
    const globalState = await getGlobalState(connection, wallet);
    return globalState.superOwner;
  } catch (e) {
    console.error('Error while fetching the super owner');
    throw e;
  }
}

export async function isGlobalStateCreated(connection: Connection, wallet: any) {
  const globalState = await retrieveGlobalState(connection,wallet);
  if (globalState) {
    return true;
  }
  return false;
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
    console.log(e);
  }
  try {
    await program.rpc.createGlobalState(globalStateNonce, mintUsdNonce, {
      accounts: {
        superOwner: wallet.publicKey,
        globalState: globalStateKey,
        mintUsd: mintUsdKey,
        ...defaultPrograms,
      },
    });
  } catch (e) {
    console.log("can't create global state");
  }

  return 'created global state';
}

export async function getUserState(connection: Connection, wallet: any, mintCollKey: PublicKey = WSOL_MINT_KEY) {
  const program = getProgramInstance(connection, wallet);
  const [tokenVaultKey] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
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
  console.log('tx id->', tx);

  return 'User borrowed ' + amount / Math.pow(10, USD_DECIMALS) + ' USD , transaction id = ' + tx;
}

export async function getTokenVaultByMint(connection: Connection, mint: string) {
  const program = getProgramInstance(connection, null);
  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), new PublicKey(mint).toBuffer()],
    program.programId
  );
  try {
    const tokenVault = await program.account.tokenVault.fetch(tokenVaultKey);
    return tokenVault;
  } catch (e) {
    return null;
  }
}

export async function createTokenVault(
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
  console.log('Global State', globalState);
  console.log('Super Owner', globalState.superOwner.toString());

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  console.log('tokenVaultKey', tokenVaultKey.toBase58());
  const [tokenCollKey, tokenCollNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_POOL_TAG), tokenVaultKey.toBuffer()],
    program.programId
  );
  console.log('tokenCollKey', tokenCollKey.toBase58());
  // try {
  //   const tokenVault = await program.account.tokenVault.fetch(tokenVaultKey);
  //   console.log('fetched tokenVault', tokenVault);
  //   console.log('This token vault was already created!');
  //   return 'already created';
  // } catch (e) {}
  console.log(
    'payer',
    wallet.publicKey.toString(),
    '\n',
    'tokenVaultKey',
    tokenVaultKey.toString(),
    '\n',
    'globalStateKey',
    globalStateKey.toString(),
    '\n',
    'mintCollKey',
    mintCollKey.toString(),
    '\n',
    'tokenCollKey',
    tokenCollKey.toString(),
    '\n'
  );
  try {
    await program.rpc.createTokenVault(tokenVaultNonce, globalStateNonce, tokenCollNonce, riskLevel, {
      accounts: {
        payer: wallet.publicKey,
        tokenVault: tokenVaultKey,
        globalState: globalStateKey,
        mintColl: mintCollKey,
        tokenColl: tokenCollKey,
        ...defaultPrograms,
      },
    });
    return 'created token vault successfully';
  } catch (e) {
    console.log("can't create token vault");
  }
}

export async function createUserTrove(connection: Connection, wallet: any, mintCollKey: PublicKey = WSOL_MINT_KEY) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const program = getProgramInstance(connection, wallet);

  const [tokenVaultKey, tokenVaultNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(TOKEN_VAULT_TAG), mintCollKey.toBuffer()],
    program.programId
  );
  const [userTroveKey, userTroveNonce] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from(USER_TROVE_TAG), tokenVaultKey.toBuffer(), wallet.publicKey.toBuffer()],
    program.programId
  );
  try {
    const userTrove = await program.account.userTrove.fetch(userTroveKey);
    console.log('fetched userTrove', userTrove);
    console.log('This user trove was already created!');
    return 'already created!';
  } catch (e) {}

  try {
    await program.rpc.createUserTrove(userTroveNonce, tokenVaultNonce, {
      accounts: {
        troveOwner: wallet.publicKey,
        userTrove: userTroveKey,
        tokenVault: tokenVaultKey,
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

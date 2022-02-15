import { PublicKey } from '@solana/web3.js';

/// COMMON IDS
export const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111');
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const RENT_PROGRAM_ID = new PublicKey('SysvarRent111111111111111111111111111111111');
export const CLOCK_PROGRAM_ID = new PublicKey('SysvarC1ock11111111111111111111111111111111');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
/// COMMON IDS

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const LENDING_PROGRAM_ID = new PublicKey('TokenLending1111111111111111111111111111111');

export const SWAP_PROGRAM_ID = new PublicKey('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8');

export const STABLE_POOL_PROGRAM_ID = new PublicKey('BRryWAy5a9yZsruQEKJpRfKGyQy7DeBtZ1JZnDuVhVjF');

export const FAUCET_PROGRAM_ID = new PublicKey('7YVa3g284KuyHYNNHnbR9nRkXQFKpFtrhUym7X7My6UR');

export const PROGRAM_IDS = [
  {
    name: 'mainnet-beta',
  },
  {
    name: 'testnet',
  },
  {
    name: 'devnet',
  },
  {
    name: 'localnet',
  },
];

export const setProgramIds = (envName: string) => {
  const instance = PROGRAM_IDS.find((env) => env.name === envName);
  if (!instance) {
    return;
  }
};

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
  };
};

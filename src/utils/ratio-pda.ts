import { PublicKey } from '@solana/web3.js';
import { utils } from '@project-serum/anchor';
import { RATIO_LENDING_PROGRAM_ID } from '../constants/ids';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const GLOBAL_STATE_SEED = 'GLOBAL_STATE_SEED';
const POOL_SEED = 'POOL_SEED';
const USER_STATE_SEED = 'USER_STATE_SEED';
const VAULT_SEED = 'VAULT_SEED';
const ORACLE_SEED = 'ORACLE_SEED';

const getPda = (seeds: Buffer[], programId: PublicKey) => {
  return utils.publicKey.findProgramAddressSync(seeds, programId);
};

export const getGlobalStatePDA = () => {
  const [pda] = getPda([Buffer.from(GLOBAL_STATE_SEED)], RATIO_LENDING_PROGRAM_ID);
  return pda;
};

// const getGlobalStatePDAWithBump = () => {
//   return getPda([Buffer.from(GLOBAL_STATE_SEED)], RATIO_LENDING_PROGRAM_ID);
// };

export const getOraclePDA = (mint: string | PublicKey) => {
  const [pda] = getPda([Buffer.from(ORACLE_SEED), new PublicKey(mint).toBuffer()], RATIO_LENDING_PROGRAM_ID);
  return pda;
};

export const getATAKey = (owner: string | PublicKey, mint: string | PublicKey) => {
  const [ata] = getPda(
    [new PublicKey(owner).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return ata;
};

// const getATAKeyWithBump = (owner: string | PublicKey, mint: string | PublicKey) => {
//   return getPda(
//     [new PublicKey(owner).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
//     ASSOCIATED_TOKEN_PROGRAM_ID
//   );
// };

export const getPoolPDA = (mint: string | PublicKey) => {
  const [pda] = getPda([Buffer.from(POOL_SEED), new PublicKey(mint).toBuffer()], RATIO_LENDING_PROGRAM_ID);
  return pda;
};
// const getPoolPDAWithBump = (mint: string | PublicKey) => {
//   return getPda([Buffer.from(POOL_SEED), new PublicKey(mint).toBuffer()], RATIO_LENDING_PROGRAM_ID);
// };

export const getVaultPDA = (owner: string | PublicKey, mint: string | PublicKey) => {
  const [pda] = getPda(
    [Buffer.from(VAULT_SEED), new PublicKey(mint).toBuffer(), new PublicKey(owner).toBuffer()],
    RATIO_LENDING_PROGRAM_ID
  );
  return pda;
};

// const getVaultPDAWithBump = (owner: string | PublicKey, mint: string | PublicKey) => {
//   return getPda(
//     [Buffer.from(VAULT_SEED), new PublicKey(mint).toBuffer(), new PublicKey(owner).toBuffer()],
//     RATIO_LENDING_PROGRAM_ID
//   );
// };

export const getUserStatePDA = (owner: string | PublicKey) => {
  const [pda] = getPda([Buffer.from(USER_STATE_SEED), new PublicKey(owner).toBuffer()], RATIO_LENDING_PROGRAM_ID);
  return pda;
};

// const getUserStatePDAWithBump = (owner: string | PublicKey) => {
//   return getPda([Buffer.from(USER_STATE_SEED), new PublicKey(owner).toBuffer()], RATIO_LENDING_PROGRAM_ID);
// };

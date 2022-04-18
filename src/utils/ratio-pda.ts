import { PublicKey } from '@solana/web3.js';
import { utils } from '@project-serum/anchor';
import { STABLE_POOL_PROGRAM_ID } from './ids';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { GLOBAL_STATE_SEED, MINT_USDR_SEED, ORACLE_SEED, POOL_SEED, VAULT_SEED } from './constants';

export const getPda = (seeds: Buffer[], programId: PublicKey) => {
  return utils.publicKey.findProgramAddressSync(seeds, programId);
};

export const getGlobalStatePDA = () => {
  const [pda] = getPda([Buffer.from(GLOBAL_STATE_SEED)], STABLE_POOL_PROGRAM_ID);
  return pda;
};

export const getUSDrMint = () => {
  const [pda] = getPda([Buffer.from(MINT_USDR_SEED)], STABLE_POOL_PROGRAM_ID);
  return pda;
};

export const getOraclePDA = (mint: string | PublicKey) => {
  const [pda] = getPda([Buffer.from(ORACLE_SEED), new PublicKey(mint).toBuffer()], STABLE_POOL_PROGRAM_ID);
  return pda;
};

export const getATAKey = (owner: string | PublicKey, mint: string | PublicKey) => {
  const [ata] = getPda(
    [new PublicKey(owner).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return ata;
};

export const getATAKeyWithBump = (owner: string | PublicKey, mint: string | PublicKey) => {
  return getPda(
    [new PublicKey(owner).toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mint).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

export const getPoolPDA = (mint: string | PublicKey) => {
  const [pda] = getPda([Buffer.from(POOL_SEED), new PublicKey(mint).toBuffer()], STABLE_POOL_PROGRAM_ID);
  return pda;
};
export const getPoolPDAWithBump = (mint: string | PublicKey) => {
  return getPda([Buffer.from(POOL_SEED), new PublicKey(mint).toBuffer()], STABLE_POOL_PROGRAM_ID);
};

export const getVaultPDA = (owner: string | PublicKey, mint: string | PublicKey) => {
  const [pda] = getPda(
    [Buffer.from(VAULT_SEED), new PublicKey(mint).toBuffer(), new PublicKey(owner).toBuffer()],
    STABLE_POOL_PROGRAM_ID
  );
  return pda;
};

export const getVaultPDAWithBump = (owner: string | PublicKey, mint: string | PublicKey) => {
  return getPda(
    [Buffer.from(VAULT_SEED), new PublicKey(mint).toBuffer(), new PublicKey(owner).toBuffer()],
    STABLE_POOL_PROGRAM_ID
  );
};

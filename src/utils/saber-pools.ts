/* eslint-disable prettier/prettier */
import { Connection } from '@solana/web3.js';
import { getDevnetPools, getMainnetPools } from './saber/ids';
import { LPair } from '../types/VaultTypes';
// import { SABER_QUARRY_NEW } from './saber/constants';

export async function getSaberFarmsInfo(conn: Connection, connEnv: string, vaults: LPair[]) {
  const saberFarms = [];
  const pools = connEnv === 'devnet' ? await getDevnetPools() : await getMainnetPools();
  for (let i = 0; i < pools.length; i++) {
    if (vaults.find((v) => v.address_id === pools[i].lpAddress)) {
      saberFarms.push(pools[i]);
    }
  }
  return saberFarms;
}

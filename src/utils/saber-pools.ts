/* eslint-disable prettier/prettier */
import { Connection } from '@solana/web3.js';
import { getDevnetPools, getMainnetPools } from './saber/ids';
import { LPair } from '../types/VaultTypes';
// import { SABER_QUARRY_NEW } from './saber/constants';

export async function getSaberFarmsInfo(conn: Connection, connEnv: string, vaults: LPair[]) {
  const saberFarms = [];
  const pools = connEnv === 'devnet' ? await getDevnetPools() : await getMainnetPools();
  for (let i = 0; i < pools.length; i++) {
    if (vaults.find((v) => v.platform_symbol === pools[i].name && v.platform_name === 'SABER')) {
      saberFarms.push(pools[i]);
    }
  }
  return saberFarms;
}

import { LPair } from '../../types/VaultTypes';

export interface IPoolInfoProvider {
  getTVLbyVault(vault: LPair): number;
}

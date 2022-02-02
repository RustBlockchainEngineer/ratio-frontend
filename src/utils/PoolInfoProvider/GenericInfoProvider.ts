import { LPair } from '../../types/VaultTypes';
import { IPoolInfoProvider } from './IPoolInfoProvider';

export abstract class GenericInfoProvider implements IPoolInfoProvider {
  poolInfoCache:
    | {
        [key: string]: any;
      }
    | undefined;
  constructor(poolsInfo: any) {
    this.poolInfoCache = poolsInfo;
  }
  abstract getTVLbyVault(vault: LPair): number;
}
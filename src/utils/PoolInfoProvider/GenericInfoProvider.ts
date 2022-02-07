import { LPair, LPairAPRLast } from '../../types/VaultTypes';
import { IPoolInfoProvider } from './IPoolInfoProvider';
import { API_ENDPOINT } from '../../constants';

const ratioAPRCache: {
  [key: string]: any;
} = {};

export abstract class GenericInfoProvider implements IPoolInfoProvider {
  poolInfoCache:
    | {
        [key: string]: any;
      }
    | undefined;

  constructor(poolsInfo: any) {
    this.poolInfoCache = poolsInfo;
  }

  async getRatioAPRbyVault(vault: LPair): Promise<number> {
    try {
      const url = `${API_ENDPOINT}/lpairs/${vault.address_id}/apr/last`;
      if (ratioAPRCache[url]) {
        const data = ratioAPRCache[url];
        return data?.apr ?? 0;
      } else {
        const response = await fetch(url);
        const data: LPairAPRLast = await response.json();

        // We cache the data
        ratioAPRCache[url] = data;
        return data?.apr ?? 0;
      }
    } catch (err) {
      return 0;
    }
  }

  abstract getTVLbyVault(vault: LPair): number;

  abstract depositLP(): boolean;

  abstract withdrawLP(): boolean;

  abstract harvestReward(): boolean;

  abstract getRewards(): number;
}

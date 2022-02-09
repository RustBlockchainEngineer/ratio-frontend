import { LPair, LPairAPRLast } from '../../types/VaultTypes';
import { IPoolInfoProvider } from './IPoolInfoProvider';
import { API_ENDPOINT } from '../../constants';
import { Connection } from '@solana/web3.js';
import { postWithAuthToRatioApi } from '../ratioApi';

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

  abstract depositLP(connection: Connection, wallet: any): boolean;

  abstract withdrawLP(connection: Connection, wallet: any): boolean;

  abstract harvestReward(connection: Connection, wallet: any): boolean;

  abstract getRewards(): number;

  async postTransactionToApi(txSignature: string, wallet:any,authToken: any) : Promise<any> {
    const response = await postWithAuthToRatioApi({},`${wallet?.publicKey}${txSignature}`,authToken);
    return response;
  }
}

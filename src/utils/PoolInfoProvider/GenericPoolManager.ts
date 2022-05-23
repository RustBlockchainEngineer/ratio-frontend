/* eslint-disable prettier/prettier */
import { LPair, LPairAPRLast } from '../../types/VaultTypes';
import { IPoolManagerStrategy } from './IPoolManagerStrategy';
import { API_ENDPOINT } from '../../constants';
import { Connection } from '@solana/web3.js';
import { postToRatioApi } from '../ratioApi';
import { USDR_MINT_KEY } from '../ratio-lending';

const ratioAPRCache: {
  [key: string]: any;
} = {};

export abstract class GenericPoolManager implements IPoolManagerStrategy {
  poolInfoCache:
    | {
        [key: string]: any;
      }
    | undefined;

  constructor(poolsInfo: any) {
    this.poolInfoCache = poolsInfo;
  }

  async getRatioAPYbyVault(vault: LPair): Promise<number> {
    let apr = 0;
    try {
      const url = `${API_ENDPOINT}/lpairs/${vault.address_id}/apr/last`;
      if (ratioAPRCache[url]) {
        const data = ratioAPRCache[url];
        apr = data?.apr ?? 0;
      } else {
        const response = await fetch(url);
        const data: LPairAPRLast = await response.json();

        // We cache the data
        ratioAPRCache[url] = data;
        apr = data?.apr ?? 0;
      }
    } catch (err) {
      apr = 0;
    }
    // console.log('apr', apr);
    // apr is percent
    // const apy = Number(((1 + (apr / 100) / 365) ** 365 - 1) * 100)
    return apr;
  }
  abstract getTokenName();
  abstract getLpLink(value: string);
  abstract getTVLbyVault(vault: LPair): number;

  abstract depositLP(
    connection: Connection,
    wallet: any,
    vault: LPair,
    amount: number,
    tokenAccount: string
  ): Promise<string>;

  abstract withdrawLP(
    connection: Connection,
    wallet: any,
    vault: LPair,
    amount: number,
    tokenAccount: string
  ): Promise<string>;

  abstract harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<string>;

  abstract getRewards(connection: Connection, wallet: any, vault: LPair): Promise<number>;

  async postTransactionToApi(
    txSignature: string,
    lp_token_address: string,
    txType: string,
    walletPublicKey: string,
    status: string
  ): Promise<any> {
    // /transaction/:wallet_id/new`
    try {
      const response = await postToRatioApi(
        {
          tx_type: txType,
          address_id: txType === 'harvest' ? USDR_MINT_KEY : lp_token_address,
          signature: txSignature,
          vault_address: lp_token_address,
          status: status,
        },
        `/transaction/${walletPublicKey}/new`
      );
      console.log('SUCCESSFUL RESPONSE FROM BACKEND', response);
    } catch (error) {
      console.error('ERROR FROM BACKEND', error);
      // throw error;
    }
  }
}

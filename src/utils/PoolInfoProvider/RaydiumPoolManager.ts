import { LPair } from '../../types/VaultTypes';
import { GenericPoolManager } from './GenericPoolManager';
import { randomInteger } from '../utils';
import { Connection } from '@solana/web3.js';

export class RaydiumPoolManager extends GenericPoolManager {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    let vaultInfo = this.poolInfoCache[vault.platform_symbol ?? vault.symbol];
    if (!vaultInfo) {
      vaultInfo = this.poolInfoCache[vault.symbol.split('-').reverse().join('-')];
    }
    if (!vaultInfo) {
      vaultInfo = Object.values(this.poolInfoCache).find((item: any) => {
        const poolTokens = (item.token_id as string).split('-');
        if (poolTokens.length !== vault.lpasset?.length) {
          return false;
        }
        let result = true;
        let index = 0;
        while (result && index < poolTokens.length) {
          result = result && vault.lpasset.some((lpasset) => lpasset.token_address_id === poolTokens[index]);
          index++;
        }
        return result;
      });
    }
    return vaultInfo?.tvl as number;
  }

  // eslint-disable-next-line
  async depositLP(connection: Connection, wallet: any, vault: LPair, amount: number): Promise<string> {
    // TODO Implement this function

    alert('Raydium: Deposit LP');
    console.error('Function not implemented yet');

    return 'not implemented';
  }

  // eslint-disable-next-line
  async withdrawLP(connection: Connection, wallet: any, vault: LPair, amount: number): Promise<string> {
    // TODO Implement this function

    alert('Raydium: Withdraw LP');
    console.error('Function not implemented yet');

    return 'not implemented';
  }

  // eslint-disable-next-line
  async harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<string> {
    // TODO Implement this function

    alert('Raydium: Harvest Reward');
    console.error('Function not implemented yet');

    return 'not implemented';
  }

  async getRewards(): Promise<number> {
    // TODO Implement this function

    console.error('Function not implemented yet');

    return randomInteger(1, 100);
  }
}

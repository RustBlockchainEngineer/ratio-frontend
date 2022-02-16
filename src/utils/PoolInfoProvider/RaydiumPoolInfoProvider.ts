import { LPair } from '../../types/VaultTypes';
import { GenericInfoProvider } from './GenericInfoProvider';
import { randomInteger } from '../utils';
import { Connection } from '@solana/web3.js';

export class RaydiumPoolInfoProvider extends GenericInfoProvider {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    let vaultInfo = this.poolInfoCache[vault.symbol];
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

  depositLP(connection: Connection, wallet: any, vault: LPair, amount: number): boolean {
    // TODO Implement this function

    alert('Raydium: Deposit LP');
    console.error('Function not implemented yet');

    return true;
  }

  withdrawLP(connection: Connection, wallet: any, vault: LPair, amount: number): boolean {
    // TODO Implement this function

    alert('Raydium: Withdraw LP');
    console.error('Function not implemented yet');

    return true;
  }

  harvestReward(connection: Connection, wallet: any, vault: LPair): boolean {
    // TODO Implement this function

    alert('Raydium: Harvest Reward');
    console.error('Function not implemented yet');

    return true;
  }

  getRewards(): number {
    // TODO Implement this function

    console.error('Function not implemented yet');

    return randomInteger(1, 100);
  }
}

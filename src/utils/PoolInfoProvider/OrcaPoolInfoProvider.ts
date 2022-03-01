import { LPair } from '../../types/VaultTypes';
import { GenericInfoProvider } from './GenericInfoProvider';
import { randomInteger } from '../utils';
import { Connection } from '@solana/web3.js';

export class OrcaPoolInfoProvider extends GenericInfoProvider {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    let vaultInfo = this.poolInfoCache[vault.symbol.replace('-', '/')];
    if (!vaultInfo) {
      vaultInfo = Object.values(this.poolInfoCache).find((item: any) => item.account === vault.address_id);
    }
    return vaultInfo?.tvl as number;
  }

  async depositLP(connection: Connection, wallet: any, vault: LPair): Promise<boolean> {
    // TODO Implement this function

    alert('Orca: Deposit LP');
    console.error('Function not implemented yet');

    return true;
  }

  async withdrawLP(connection: Connection, wallet: any, vault: LPair): Promise<boolean> {
    // TODO Implement this function

    alert('Orca: Withdraw LP');
    console.error('Function not implemented yet');

    return true;
  }

  async harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<boolean> {
    // TODO Implement this function

    alert('Orca: Harvest Reward');
    console.error('Function not implemented yet');

    return true;
  }

  async getRewards(): Promise<number> {
    // TODO Implement this function

    console.error('Function not implemented yet');

    return randomInteger(1, 100);
  }
}

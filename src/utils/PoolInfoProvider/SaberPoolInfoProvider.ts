import { LPair } from '../../types/VaultTypes';
import { GenericInfoProvider } from './GenericInfoProvider';
import { randomInteger } from '../utils';

export class SaberPoolInfoProvider extends GenericInfoProvider {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    const vaultInfo = this.poolInfoCache[vault.symbol];
    return vaultInfo?.tvl as number;
  }

  depositLP(): boolean {
    // TODO Implement this function

    alert('Saber: Deposit LP');
    console.error('Function not implemented yet');

    return true;
  }

  withdrawLP(): boolean {
    // TODO Implement this function

    alert('Saber: Withdraw LP');
    console.error('Function not implemented yet');

    return true;
  }

  harvestReward(): boolean {
    // TODO Implement this function

    alert('Saber: Harvest Reward');
    console.error('Function not implemented yet');

    return true;
  }

  getRewards(): number {
    // TODO Implement this function

    console.error('Function not implemented yet');

    return randomInteger(1, 100);
  }
}

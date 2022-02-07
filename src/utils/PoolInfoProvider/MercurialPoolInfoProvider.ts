import { LPair } from '../../types/VaultTypes';
import { GenericInfoProvider } from './GenericInfoProvider';
import { randomInteger } from '../utils';

export class MercurialPoolInfoProvider extends GenericInfoProvider {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    let vaultInfo = this.poolInfoCache[vault.symbol];
    if (!vaultInfo) {
      vaultInfo = Object.values(this.poolInfoCache).find((item: any) => item.account === vault.address_id);
    }
    return vaultInfo?.tvl as number;
  }

  depositLP(): boolean {
    // TODO Implement this function

    alert('Mercurial: Deposit LP');
    console.error('Function not implemented yet');

    return true;
  }

  withdrawLP(): boolean {
    // TODO Implement this function

    alert('Mercurial: Withdraw LP');
    console.error('Function not implemented yet');

    return true;
  }

  harvestReward(): boolean {
    // TODO Implement this function

    alert('Mercurial: Harvest Reward');
    console.error('Function not implemented yet');

    return true;
  }

  getRewards(): number {
    // TODO Implement this function

    console.error('Function not implemented yet');

    return randomInteger(1, 100);
  }
}

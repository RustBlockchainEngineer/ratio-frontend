import { LPair } from '../../types/VaultTypes';

export interface IPoolInfoProvider {
  getTVLbyVault(vault: LPair): number;

  getRatioAPRbyVault(vault: LPair): Promise<number>;

  depositLP(): boolean;

  withdrawLP(): boolean;

  harvestReward(): boolean;

  getRewards(): number;
}

import { LPair } from '../../types/VaultTypes';
import { Connection } from '@solana/web3.js';

export interface IPoolInfoProvider {
  getTVLbyVault(vault: LPair): number;

  getRatioAPRbyVault(vault: LPair): Promise<number>;

  depositLP(connection: Connection, wallet: any): boolean;

  withdrawLP(connection: Connection, wallet: any): boolean;

  harvestReward(connection: Connection, wallet: any): boolean;

  getRewards(): number;
}

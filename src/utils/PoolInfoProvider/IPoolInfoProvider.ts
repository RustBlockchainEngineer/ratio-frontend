import { LPair } from '../../types/VaultTypes';
import { Connection } from '@solana/web3.js';

export interface IPoolInfoProvider {
  getTVLbyVault(vault: LPair): number;

  getRatioAPYbyVault(vault: LPair): Promise<number>;

  depositLP(connection: Connection, wallet: any, vault: LPair, amount: number, tokenAccount: string): Promise<string>;

  withdrawLP(connection: Connection, wallet: any, vault: LPair, amount: number, tokenAccount: string): Promise<boolean>;

  harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<boolean>;

  getRewards(connection: Connection, wallet: any, vault: LPair): Promise<number>;
}

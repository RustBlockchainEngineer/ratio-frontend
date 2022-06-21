import { LPair } from '../../types/VaultTypes';
import { Connection } from '@solana/web3.js';

export interface IPoolManagerStrategy {
  getRatioAPYbyVault(vault: LPair): Promise<number>;

  depositLP(connection: Connection, wallet: any, vault: LPair, amount: number, tokenAccount: string): Promise<string>;

  withdrawLP(connection: Connection, wallet: any, vault: LPair, amount: number, tokenAccount: string): Promise<string>;

  harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<string>;

  harvestRatioReward(connection: Connection, wallet: any, vault: LPair): Promise<string>;

  getRewards(connection: Connection, wallet: any, vault: LPair): Promise<number>;

  getTokenName(): string;
  getLpLink(value: string): string;
}

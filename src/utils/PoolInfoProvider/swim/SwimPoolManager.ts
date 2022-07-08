/* eslint-disable @typescript-eslint/no-unused-vars */

import { LPair } from '../../../types/VaultTypes';
import { GenericPoolManager } from '../GenericPoolManager';
import { Connection, PublicKey } from '@solana/web3.js';
import { deposit, withdraw } from './swim-utils';

export class SwimPoolManager extends GenericPoolManager {
  async depositLP(connection: Connection, wallet: any, vault: LPair, amount: number): Promise<string> {
    const txHash = await deposit(connection, wallet, new PublicKey(vault.address_id), amount);
    // this.postTransactionToApi(txHash, vault.address_id, 'deposit', wallet?.publicKey, 'confirmed');
    return txHash;
  }

  async withdrawLP(connection: Connection, wallet: any, vault: LPair, amount: number): Promise<string> {
    const txHash = await withdraw(connection, wallet, new PublicKey(vault.address_id), amount);
    // this.postTransactionToApi(txHash, vault.address_id, 'withdraw', wallet?.publicKey, 'confirmed');
    return txHash;
  }

  async harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<string> {
    return '';
  }

  async getRewards(connection: Connection, wallet: any, vault: LPair): Promise<number> {
    return 0;
  }

  getTokenName() {
    return 'No Reward';
  }

  getLpLink = (value: string) => {
    return 'https://swim.io/pools/hexapool';
  };
}

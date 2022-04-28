import { LPair } from '../../types/VaultTypes';
import { GenericPoolManager } from './GenericPoolManager';
import { Connection, PublicKey } from '@solana/web3.js';
import { calculateRewardByPlatform, TYPE_ID_SABER } from '../ratio-lending';
import { deposit, harvest, withdraw } from '../saber/saber-utils';

export class SaberPoolManager extends GenericPoolManager {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    const vaultInfo = this.poolInfoCache[vault.platform_symbol ?? vault.symbol];
    return vaultInfo?.tvl as number;
  }

  async depositLP(
    connection: Connection,
    wallet: any,
    vault: LPair,
    amount: number,
    tokenAccount: string
  ): Promise<string> {
    const txHash = await deposit(
      connection,
      wallet,
      new PublicKey(vault.address_id),
      new PublicKey(tokenAccount),
      amount
    );
    this.postTransactionToApi(txHash, vault.address_id, 'deposit', wallet?.publicKey);
    return txHash;
  }

  async withdrawLP(connection: Connection, wallet: any, vault: LPair, amount: number): Promise<string> {
    const txHash = await withdraw(connection, wallet, new PublicKey(vault.address_id), amount);
    this.postTransactionToApi(txHash, vault.address_id, 'withdraw', wallet?.publicKey);
    return txHash;
  }

  async harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<string> {
    const txHash = await harvest(connection, wallet, new PublicKey(vault.address_id));
    this.postTransactionToApi(txHash as string, vault.address_id, 'harvest', wallet?.publicKey);
    return txHash;
  }

  async getRewards(connection: Connection, wallet: any, vault: LPair): Promise<number> {
    // TODO Implement this function
    if (vault) {
      const amount = await calculateRewardByPlatform(
        connection,
        wallet,
        new PublicKey(vault.address_id),
        TYPE_ID_SABER
      );

      return amount;
    }
    return 0;
  }
}

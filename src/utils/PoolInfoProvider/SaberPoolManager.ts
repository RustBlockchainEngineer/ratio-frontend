import { LPair } from '../../types/VaultTypes';
import { GenericPoolManager } from './GenericPoolManager';
import { Connection, PublicKey } from '@solana/web3.js';
import { calculateRewardByPlatform, TYPE_ID_SABER } from '../ratio-lending';
import { depositToSaber, harvestFromSaber, withdrawFromSaber } from '../saber/saber-utils';

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
    const txHash = await depositToSaber(
      connection,
      wallet,
      new PublicKey(vault.address_id),
      amount,
      new PublicKey(tokenAccount)
    );
    this.postTransactionToApi(txHash, 'deposit', wallet?.publicKey);
    return txHash;
  }

  async withdrawLP(
    connection: Connection,
    wallet: any,
    vault: LPair,
    amount: number,
    tokenAccount: string
  ): Promise<string> {
    const txHash = await withdrawFromSaber(
      connection,
      wallet,
      new PublicKey(vault.address_id),
      amount,
      new PublicKey(tokenAccount)
    );
    this.postTransactionToApi(txHash, 'withdraw', wallet?.publicKey);
    return txHash;
  }

  async harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<string> {
    const txHash = await harvestFromSaber(connection, wallet, new PublicKey(vault.address_id));
    this.postTransactionToApi(txHash, 'harvest', wallet?.publicKey);
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

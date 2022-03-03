import { LPair } from '../../types/VaultTypes';
import { GenericInfoProvider } from './GenericInfoProvider';
import { Connection, PublicKey } from '@solana/web3.js';
import { calculateRewardByPlatform, getUserState, TYPE_ID_SABER } from '../ratio-lending';
import { depositToSaber, harvestFromSaber, withdrawFromSaber } from '../saber/saber-utils';

export class SaberPoolInfoProvider extends GenericInfoProvider {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    const vaultInfo = this.poolInfoCache[vault.symbol];
    return vaultInfo?.tvl as number;
  }

  async depositLP(
    connection: Connection,
    wallet: any,
    vault: LPair,
    amount: number,
    tokenAccount: string
  ): Promise<boolean> {
    // TODO Implement this function

    await depositToSaber(connection, wallet, new PublicKey(vault.address_id), amount, new PublicKey(tokenAccount));
    return true;
  }

  async withdrawLP(
    connection: Connection,
    wallet: any,
    vault: LPair,
    amount: number,
    tokenAccount: string
  ): Promise<boolean> {
    // TODO Implement this function

    await withdrawFromSaber(connection, wallet, new PublicKey(vault.address_id), amount, new PublicKey(tokenAccount));

    return true;
  }

  async harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<boolean> {
    // TODO Implement this function

    await harvestFromSaber(connection, wallet, new PublicKey(vault.address_id));

    return true;
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

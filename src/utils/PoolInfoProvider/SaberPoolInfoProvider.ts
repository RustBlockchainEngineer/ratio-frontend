import { LPair } from '../../types/VaultTypes';
import { GenericInfoProvider } from './GenericInfoProvider';
import { randomInteger } from '../utils';
import { Connection, PublicKey } from '@solana/web3.js';
import { getUserState } from '../ratio-lending';
import { createSaberUserTrove, depositToSaber, harvestFromSaber, withdrawFromSaber } from '../saber/saber-utils';

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
    const user = await getUserState(connection, wallet, new PublicKey(vault.address_id));
    if (!user) {
      const tx = await createSaberUserTrove(connection, wallet, new PublicKey(vault.address_id));
    }

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

  getRewards(): number {
    // TODO Implement this function

    console.error('Function not implemented yet');

    return randomInteger(1, 100);
  }
}

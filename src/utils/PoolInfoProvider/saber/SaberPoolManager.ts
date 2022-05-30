import { LPair } from '../../../types/VaultTypes';
import { GenericPoolManager } from '../GenericPoolManager';
import { Connection, PublicKey } from '@solana/web3.js';
import { calculateRewardByPlatform, PLATFORM_IDS } from '../../ratio-lending';
import { deposit, harvest, withdraw } from './saber-utils';

export class SaberPoolManager extends GenericPoolManager {
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
    // this.postTransactionToApi(txHash, vault.address_id, 'deposit', wallet?.publicKey, 'confirmed');
    return txHash;
  }

  async withdrawLP(connection: Connection, wallet: any, vault: LPair, amount: number): Promise<string> {
    const txHash = await withdraw(connection, wallet, new PublicKey(vault.address_id), amount);
    // this.postTransactionToApi(txHash, vault.address_id, 'withdraw', wallet?.publicKey, 'confirmed');
    return txHash;
  }

  async harvestReward(connection: Connection, wallet: any, vault: LPair): Promise<string> {
    const txHash = await harvest(connection, wallet, new PublicKey(vault.address_id));
    // this.postTransactionToApi(txHash as string, vault.address_id, 'harvest', wallet?.publicKey, 'confirmed');
    return txHash;
  }

  async getRewards(connection: Connection, wallet: any, vault: LPair): Promise<number> {
    // TODO Implement this function
    if (vault) {
      const amount = await calculateRewardByPlatform(
        connection,
        wallet,
        new PublicKey(vault.address_id),
        PLATFORM_IDS.SABER
      );

      return amount;
    }
    return 0;
  }
  getTokenName() {
    return 'SBR';
  }

  getLpLink = (value: string) => {
    switch (value) {
      case 'USDH-USDC':
        return 'https://app.saber.so/pools/usdh/deposit';
        break;
      case 'UXD-USDC':
        return 'https://app.saber.so/pools/uxd/deposit';
        break;
      case 'USDT-USDC':
        return 'https://app.saber.so/pools/usdc_usdt/deposit';
        break;

      default:
        break;
    }
  };
}

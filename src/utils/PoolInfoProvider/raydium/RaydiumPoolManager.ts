import { LPair } from '../../../types/VaultTypes';
import { GenericPoolManager } from '../GenericPoolManager';
import { Connection, PublicKey } from '@solana/web3.js';
import { calculateRewardByPlatform, PLATFORM_IDS } from '../../ratio-lending';
import { deposit, harvest, withdraw } from './raydium-utils';

export class RaydiumPoolManager extends GenericPoolManager {
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
    const txHash = await harvest(connection, wallet, new PublicKey(vault.address_id));
    // this.postTransactionToApi(txHash as string, vault.address_id, 'harvest', wallet?.publicKey, 'confirmed');
    return txHash;
  }

  async getRewards(connection: Connection, wallet: any, vault: LPair): Promise<number> {
    // TODO Implement this function
    if (vault) {
      const [amount] = await calculateRewardByPlatform(
        connection,
        wallet,
        new PublicKey(vault.address_id),
        PLATFORM_IDS.RAYDIUM
      );

      return amount;
    }
    return 0;
  }
  getTokenName() {
    return 'RAY';
  }

  getLpLink = (value: string) => {
    switch (value) {
      case 'USDT-USDC':
        return 'https://raydium.io/liquidity/add/?coin0=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&coin1=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&fixed=coin0&ammId=2EXiumdi14E9b8Fy62QcA5Uh6WdHS2b38wtSxp72Mibj';
      default:
        break;
    }
  };
}

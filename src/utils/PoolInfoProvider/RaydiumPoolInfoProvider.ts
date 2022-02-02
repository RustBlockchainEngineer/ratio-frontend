import { LPair } from '../../types/VaultTypes';
import { GenericInfoProvider } from './GenericInfoProvider';

export class RaydiumPoolInfoProvider extends GenericInfoProvider {
  getTVLbyVault(vault: LPair): number {
    if (!this.poolInfoCache) {
      return NaN;
    }
    let vaultInfo = this.poolInfoCache[vault.symbol];
    if (!vaultInfo) {
      vaultInfo = Object.values(this.poolInfoCache).find((item: any) => {
        const poolTokens = (item.token_id as string).split('-');
        if (poolTokens.length !== vault.lpasset?.length) {
          return false;
        }
        let result = true;
        let index = 0;
        while (result && index < poolTokens.length) {
          result = result && vault.lpasset.some((lpasset) => lpasset.token_address_id === poolTokens[index]);
          index++;
        }
        return result;
      });
    }
    return vaultInfo?.tvl as number;
  }
}
import { LPair, PoolProvider } from '../../types/VaultTypes';
import { IPoolManagerStrategy } from './IPoolManagerStrategy';
import { MercurialPoolManager } from './MercurialPoolManager';
import { OrcaPoolManager } from './OrcaPoolManager';
import { RaydiumPoolManager } from './RaydiumPoolManager';
import { SaberPoolManager } from './SaberPoolManager';

// Allows to obtain the specific provider related to the vault's platform.
export class PoolManagerFactory {
  providers: {
    [Key in PoolProvider as string]: IPoolManagerStrategy;
  };
  constructor(_raydiumPools: any, _orcaPools: any, _saberPools: any, _mercurialPools: any) {
    this.providers = {};
    this.providers[PoolProvider.ORCA] = new OrcaPoolManager(_orcaPools);
    this.providers[PoolProvider.RAYDIUM] = new RaydiumPoolManager(_raydiumPools);
    this.providers[PoolProvider.SABER] = new SaberPoolManager(_saberPools);
    this.providers[PoolProvider.MERCURIAL] = new MercurialPoolManager(_mercurialPools);
  }
  getProviderForVault(vault: LPair): IPoolManagerStrategy {
    if (vault.platform_name === undefined) {
      throw 'No platform provided';
    }
    return this.providers[vault.platform_name];
  }
}

export const getPoolManager = (raydiumPools: any, orcaPools: any, saberPools: any, mercurialPools: any) => {
  return new PoolManagerFactory(raydiumPools, orcaPools, saberPools, mercurialPools);
};

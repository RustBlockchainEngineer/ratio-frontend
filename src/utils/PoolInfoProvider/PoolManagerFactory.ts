import { LPair, PoolProvider } from '../../types/VaultTypes';
import { IPoolManagerStrategy } from './IPoolManagerStrategy';
// import { MercurialPoolManager } from './MercurialPoolManager';
// import { OrcaPoolManager } from './OrcaPoolManager';
// import { RaydiumPoolManager } from './RaydiumPoolManager';
import { SaberPoolManager } from './saber/SaberPoolManager';

interface Pools {
  raydiumPools?: any;
  orcaPools?: any;
  saberPools?: any;
  mercurialPools?: any;
}

// Allows to obtain the specific provider related to the vault's platform.
export class PoolManagerFactory {
  providers: {
    [Key in PoolProvider as string]: IPoolManagerStrategy;
  };
  constructor(pools: Pools) {
    this.providers = {};
    // this.providers[PoolProvider.ORCA] = new OrcaPoolManager(_orcaPools);
    // this.providers[PoolProvider.RAYDIUM] = new RaydiumPoolManager(_raydiumPools);
    this.providers[PoolProvider.SABER] = new SaberPoolManager(pools.saberPools);
    // this.providers[PoolProvider.MERCURIAL] = new MercurialPoolManager(_mercurialPools);
  }
  getProviderForVault(vault: LPair): IPoolManagerStrategy {
    if (vault.platform_name === undefined) {
      throw 'No platform provided';
    }
    return this.providers[vault.platform_name];
  }
}
export const getPoolManager = (pools: Pools) => {
  return new PoolManagerFactory(pools);
};

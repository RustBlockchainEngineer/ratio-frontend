import { LPair, PoolProvider } from '../../types/VaultTypes';
import { IPoolManagerStrategy } from './IPoolManagerStrategy';
import { RaydiumPoolManager } from './raydium/RaydiumPoolManager';

// import { MercurialPoolManager } from './MercurialPoolManager';
// import { OrcaPoolManager } from './OrcaPoolManager';
// import { RaydiumPoolManager } from './RaydiumPoolManager';
import { SaberPoolManager } from './saber/SaberPoolManager';
import { SwimPoolManager } from './swim/SwimPoolManager';

// Allows to obtain the specific provider related to the vault's platform.
export class PoolManagerFactory {
  private static instance: PoolManagerFactory;
  private static providers: {
    [Key in PoolProvider as string]: IPoolManagerStrategy;
  };
  private constructor() {
    PoolManagerFactory.providers = {};
    // this.providers[PoolProvider.ORCA] = new OrcaPoolManager(_orcaPools);
    PoolManagerFactory.providers[PoolProvider.RAYDIUM] = new RaydiumPoolManager();
    PoolManagerFactory.providers[PoolProvider.SABER] = new SaberPoolManager();
    PoolManagerFactory.providers[PoolProvider.SWIM] = new SwimPoolManager();
    // this.providers[PoolProvider.MERCURIAL] = new MercurialPoolManager(_mercurialPools);
  }
  getProviderForVault(vault: LPair): IPoolManagerStrategy {
    return PoolManagerFactory.providers[vault?.platform_name];
  }
  static getPoolManager = () => {
    if (!PoolManagerFactory.instance) {
      PoolManagerFactory.instance = new PoolManagerFactory();
    }
    return PoolManagerFactory.instance;
  };
}

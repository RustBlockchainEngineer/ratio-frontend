import { LPair, PoolProvider } from '../../types/VaultTypes';
import { IPoolInfoProvider } from './IPoolInfoProvider';
import { MercurialPoolInfoProvider } from './MercurialPoolInfoProvider';
import { OrcaPoolInfoProvider } from './OrcaPoolInfoProvider';
import { RaydiumPoolInfoProvider } from './RaydiumPoolInfoProvider';
import { SaberPoolInfoProvider } from './SaberPoolInfoProvider';

// Allows to obtain the specific provider related to the vault's platform.
export class PoolInfoProviderFactory {
  providers: {
    [Key in PoolProvider as string]: IPoolInfoProvider;
  };
  constructor(_raydiumPools: any, _orcaPools: any, _saberPools: any, _mercurialPools: any) {
    this.providers = {};
    this.providers[PoolProvider.ORCA] = new OrcaPoolInfoProvider(_orcaPools);
    this.providers[PoolProvider.RAYDIUM] = new RaydiumPoolInfoProvider(_raydiumPools);
    this.providers[PoolProvider.SABER] = new SaberPoolInfoProvider(_saberPools);
    this.providers[PoolProvider.MERCURIAL] = new MercurialPoolInfoProvider(_mercurialPools);
  }
  getProviderForVault(vault: LPair): IPoolInfoProvider {
    if (vault.platform_name === undefined) {
      throw 'No platform provided';
    }
    return this.providers[vault.platform_name];
  }
}

export const getFactory = (raydiumPools: any, orcaPools: any, saberPools: any, mercurialPools: any) => {
  return new PoolInfoProviderFactory(raydiumPools, orcaPools, saberPools, mercurialPools);
};

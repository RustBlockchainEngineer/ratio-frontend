import { PoolManagerFactory } from '../utils/PoolInfoProvider/PoolManagerFactory';
import { IPoolManagerStrategy } from '../utils/PoolInfoProvider/IPoolManagerStrategy';
import { LPair } from '../types/VaultTypes';

export const useGetPoolManager = (vault: LPair | undefined): Maybe<IPoolManagerStrategy> => {
  return PoolManagerFactory.getPoolManager().getProviderForVault(vault);
};

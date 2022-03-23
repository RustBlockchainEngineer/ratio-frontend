import { useEffect, useMemo, useState } from 'react';
import { getPoolManager } from '../utils/PoolInfoProvider/PoolManagerFactory';
import { LPair } from '../types/VaultTypes';
import { IPoolManagerStrategy } from '../utils/PoolInfoProvider/IPoolManagerStrategy';
import { useMercurialPools, useOrcaPools, useRaydiumPools, useSaberPools } from '../contexts/pools';

export const useGetPoolManager = (vault: LPair | undefined): Maybe<IPoolManagerStrategy> => {
  const raydiumPools = useRaydiumPools();
  const orcaPools = useOrcaPools();
  const saberPools = useSaberPools();
  const mercurialPools = useMercurialPools();

  const [poolInfoProvider, setPoolInfoProvider] = useState<Maybe<IPoolManagerStrategy>>(null);

  const PoolManagerFactory = useMemo(
    () => getPoolManager(raydiumPools, orcaPools, saberPools, mercurialPools),
    [raydiumPools, orcaPools, saberPools, mercurialPools]
  );

  useEffect(() => {
    if (!vault) {
      return;
    }

    const initPoolInfoProvider = PoolManagerFactory.getProviderForVault(vault);
    setPoolInfoProvider(initPoolInfoProvider);
  }, [vault, PoolManagerFactory]);

  return poolInfoProvider;
};

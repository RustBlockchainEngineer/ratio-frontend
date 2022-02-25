import { useEffect, useMemo, useState } from 'react';
import { getFactory } from '../utils/PoolInfoProvider/PoolInfoProviderFactory';
import { LPair } from '../types/VaultTypes';
import { IPoolInfoProvider } from '../utils/PoolInfoProvider/IPoolInfoProvider';
import { useMercurialPools, useOrcaPools, useRaydiumPools, useSaberPools } from '../contexts/pools';

export const useGetPoolInfoProvider = (vault: LPair | undefined): Maybe<IPoolInfoProvider> => {
  const raydiumPools = useRaydiumPools();
  const orcaPools = useOrcaPools();
  const saberPools = useSaberPools();
  const mercurialPools = useMercurialPools();

  const [poolInfoProvider, setPoolInfoProvider] = useState<Maybe<IPoolInfoProvider>>(null);

  const poolInfoProviderFactory = useMemo(
    () => getFactory(raydiumPools, orcaPools, saberPools, mercurialPools),
    [raydiumPools, orcaPools, saberPools, mercurialPools]
  );

  useEffect(() => {
    if (!vault) {
      return;
    }

    const initPoolInfoProvider = poolInfoProviderFactory.getProviderForVault(vault);
    setPoolInfoProvider(initPoolInfoProvider);
  }, [vault, poolInfoProviderFactory]);

  return poolInfoProvider;
};

import { useEffect, useMemo, useState } from 'react';
import { useMercurialPoolsInfo } from './useMercurialPoolInfo';
import { useOrcaPoolsInfo } from './useOrcaPoolInfo';
import { useRaydiumPoolsInfo } from './useRaydiumPoolInfo';
import { useSaberPoolsInfo } from './useSaberPoolInfo';
import { getFactory } from '../utils/PoolInfoProvider/PoolInfoProviderFactory';
import { LPair } from '../types/VaultTypes';
import { IPoolInfoProvider } from '../utils/PoolInfoProvider/IPoolInfoProvider';

export const useGetPoolInfoProvider = (vault: LPair | undefined): Maybe<IPoolInfoProvider> => {
  const { pools: raydiumPools } = useRaydiumPoolsInfo();
  const { pools: orcaPools } = useOrcaPoolsInfo();
  const { pools: saberPools } = useSaberPoolsInfo();
  const { pools: mercurialPools } = useMercurialPoolsInfo();

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

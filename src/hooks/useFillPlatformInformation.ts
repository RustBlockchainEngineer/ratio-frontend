import { useEffect, useMemo, useState } from 'react';
import { useMercurialPoolsInfo } from './useMercurialPoolInfo';
import { useOrcaPoolsInfo } from './useOrcaPoolInfo';
import { useRaydiumPoolsInfo } from './useRaydiumPoolInfo';
import { useSaberPoolsInfo } from './useSaberPoolInfo';
import { getFactory } from '../utils/PoolInfoProvider/PoolInfoProviderFactory';
import { LPair } from '../types/VaultTypes';

/* 
  This custom hook allows to fill the platforms tvl information for each of the vaults received, depending on the platform related to the vault. 

  Example usage: 
    const vaultsWithPlatformInformation = useFillPlatformInformation(vaults);
*/
export const useFillPlatformInformation = (vaults: LPair[]) => {
  const [vaultsWithInformation, setVaultsWithInformation] = useState<LPair[]>([]);
  const { pools: raydiumPools } = useRaydiumPoolsInfo();
  const { pools: orcaPools } = useOrcaPoolsInfo();
  const { pools: saberPools } = useSaberPoolsInfo();
  const { pools: mercurialPools } = useMercurialPoolsInfo();

  //Initialize the provider factory with the pools information of all the supported platforms.
  const poolInfoProviderFactory = useMemo(
    () => getFactory(raydiumPools, orcaPools, saberPools, mercurialPools),
    [raydiumPools, orcaPools, saberPools, mercurialPools]
  );

  useEffect(() => {
    if (!vaults || vaults.length === 0) {
      return;
    }
    const getPlatformInformation = async () => {
      const promises = vaults.map(async (item: LPair) => {
        //Obtain the tvl for the vault specific platform.
        item.platform_tvl = poolInfoProviderFactory.getProviderForVault(item).getTVLbyVault(item);
        item.platform_ratio_apr = await poolInfoProviderFactory.getProviderForVault(item).getRatioAPRbyVault(item);
        item.earned_rewards = poolInfoProviderFactory.getProviderForVault(item).getRewards();
        return item;
      });

      const itemVaults = await Promise.all(promises);
      setVaultsWithInformation(itemVaults);
    };

    getPlatformInformation();
  }, [vaults, poolInfoProviderFactory]);

  return vaultsWithInformation;
};

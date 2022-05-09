import { useEffect, useMemo, useState } from 'react';
import { getPoolManager } from '../utils/PoolInfoProvider/PoolManagerFactory';
import { LPair } from '../types/VaultTypes';
import { useMercurialPools, useOrcaPools, useRaydiumPools, useSaberPools } from '../contexts/pools';
import { useAllVaultInfo } from '../contexts/state';

/* 
  This custom hook allows to fill the platforms tvl information for each of the vaults received, depending on the platform related to the vault. 

  Example usage: 
    const vaultsWithPlatformInformation = useFillPlatformInformation(vaults);
*/
export const useFillPlatformInformation = (vaults: LPair[]) => {
  const [vaultsWithInformation, setVaultsWithInformation] = useState<LPair[]>([]);

  const saberPools = useSaberPools();
  const raydiumPools = useRaydiumPools();
  const orcaPools = useOrcaPools();
  const mercurialPools = useMercurialPools();

  const onChainVaultInfos = useAllVaultInfo();
  //Initialize the provider factory with the pools information of all the supported platforms.
  const PoolManagerFactory = useMemo(
    () => getPoolManager(raydiumPools, orcaPools, saberPools, mercurialPools),
    [raydiumPools, orcaPools, saberPools, mercurialPools]
  );

  useEffect(() => {
    if (!vaults || vaults.length === 0) {
      return;
    }
    console.log(vaults);
    const getPlatformInformation = async () => {
      const promises = vaults.map(async (item: LPair) => {
        item.earned_rewards = 0;
        if (onChainVaultInfos[item.address_id]) {
          item.earned_rewards = onChainVaultInfos[item.address_id]?.reward;
        }
        console.log(item);
        return item;
      });

      const itemVaults = await Promise.all(promises);
      setVaultsWithInformation(itemVaults);
    };

    getPlatformInformation();
  }, [onChainVaultInfos, vaults, PoolManagerFactory]);

  return vaultsWithInformation;
};

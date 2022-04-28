import { useEffect, useMemo, useState } from 'react';
import { getPoolManager } from '../utils/PoolInfoProvider/PoolManagerFactory';
import { LPair } from '../types/VaultTypes';
import { useMercurialPools, useOrcaPools, useRaydiumPools, useSaberPools } from '../contexts/pools';
import { useRFState } from '../contexts/state';

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

  const totalState = useRFState();
  //Initialize the provider factory with the pools information of all the supported platforms.
  const PoolManagerFactory = useMemo(
    () => getPoolManager(raydiumPools, orcaPools, saberPools, mercurialPools),
    [raydiumPools, orcaPools, saberPools, mercurialPools]
  );

  useEffect(() => {
    if (!vaults || vaults.length === 0) {
      return;
    }
    const getPlatformInformation = async () => {
      const promises = vaults.map(async (item: LPair) => {
        // Each information fetching should be safe, if any error is thrown from this method none information will be shown.
        try {
          item.platform_tvl = PoolManagerFactory.getProviderForVault(item).getTVLbyVault(item);
        } catch (error) {
          console.error("There was a problem fetching the platform's TVL.", error);
        }
        item.platform_ratio_apy = await PoolManagerFactory.getProviderForVault(item)
          .getRatioAPYbyVault(item)
          .catch((error) => {
            console.error("There was a problem fetching the platform's APR.", error);
            return 0;
          });
        // console.log('APY', item.platform_ratio_apy);
        item.earned_rewards = 0;
        if (totalState && totalState.vaultState && totalState.vaultState[item.address_id]) {
          item.earned_rewards = totalState.vaultState[item.address_id]?.reward;
        }
        return item;
      });

      const itemVaults = await Promise.all(promises);
      setVaultsWithInformation(itemVaults);
    };

    getPlatformInformation();
  }, [totalState, vaults, PoolManagerFactory]);

  return vaultsWithInformation;
};

import { useEffect, useState } from 'react';
import { LPair, LPairAPRLast } from '../types/VaultTypes';
import { API_ENDPOINT } from '../constants';

const cache: any = {};

/* 
  This custom hook allows to fill the platforms APR information for each of the vaults received, depending on the platform related to the vault.

  Example usage: 
    const vaultsWithPlatformAPR = useFillPlatformAPR(vaults);
*/
export const useFillPlatformAPR = (vaults: LPair[]) => {
  const [vaultsWithAPR, setVaultsWithAPR] = useState<LPair[]>([]);

  useEffect(() => {
    if (!vaults || vaults.length === 0) {
      return;
    }

    const mapLoop = async () => {
      const promises = vaults.map(async (item) => {
        try {
          // Obtain the APR for the vault specific platform.
          const url = `${API_ENDPOINT}/lpairs/${item.address_id}/apr/last`;

          if (cache[url]) {
            const data = cache[url];
            item.platform_apr = data?.apr ?? 0;
            return item;
          } else {
            const response = await fetch(url);
            const data: LPairAPRLast = await response.json();

            // We cache the data
            cache[url] = data;
            item.platform_apr = data?.apr ?? 0;
            return item;
          }
        } catch (err) {
          item.platform_apr = 0;
          return item;
        }
      });

      const itemVaults = await Promise.all(promises);
      setVaultsWithAPR(itemVaults);
    };

    mapLoop();
  }, [vaults]);

  return vaultsWithAPR;
};

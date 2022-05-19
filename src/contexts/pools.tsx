import React, { useContext, useEffect, useState } from 'react';
import { useFetchVaults } from '../hooks/useFetchVaults';
//import { getMercurialSwapPoolsInfo } from '../utils/PoolInfoProvider/mercurial/mercurial-pools';
//import { getOrcaSwapPoolInfo } from '../utils/PoolInfoProvider/orca/orca-pools';
//import { getRaydiumPools } from '../utils/PoolInfoProvider/raydium/ray-pools';
import { getSaberFarmsInfo } from '../utils/PoolInfoProvider/saber/saber-pools';
import { useConnection, useConnectionConfig } from './connection';
import { useWallet } from './wallet';
interface PoolsConfig {
  raydiumPools?: any;
  saberPools?: any;
  orcaPools?: any;
  mercurialPools?: any;
}

const PoolsContext = React.createContext<PoolsConfig>({
  raydiumPools: {},
  saberPools: [],
  orcaPools: [],
  mercurialPools: [],
});

export function PoolProvider({ children = undefined as any }) {
  const connection = useConnection();
  const connectionConfig = useConnectionConfig();
  const { wallet } = useWallet();

  const { vaults: platformVaultsFromBackend } = useFetchVaults(wallet?.publicKey);
  // const { vaults: platformVaultsFromBackend } = useFetchVaults();

  // const [raydiumPools, setRaydiumPools] = useState<any>(null);
  const [saberPools, setSaberPools] = useState<any>(null);
  // const [orcaPools, setOrcaPools] = useState<any>(null);
  // const [mercurialPools, setMercurialPools] = useState<any>(null);

  // useEffect(() => {
  //   try {
  //     // TODO: we are using only Saber
  //     return;

  //     getRaydiumPools(connection).then((res: any) => {
  //       setRaydiumPools(res);
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }, [connection]);

  useEffect(() => {
    try {
      getSaberFarmsInfo(connection, connectionConfig.env, platformVaultsFromBackend).then((res: any) => {
        setSaberPools(res);
      });
    } catch (e) {
      console.error(e);
    }
  }, [connection, platformVaultsFromBackend]);

  // useEffect(() => {
  //   try {
  //     // TODO: we are using only Saber
  //     return;

  //     getOrcaSwapPoolInfo().then((res: any) => {
  //       setOrcaPools(res);
  //     });
  //   } catch (e) {
  //     console.error('ORCA ERROR while obtaining pools info', e);
  //   }
  // }, [connection]);

  // useEffect(() => {
  //   try {
  //     // TODO: we are using only Saber
  //     return;

  //     getMercurialSwapPoolsInfo().then((res: any) => {
  //       setMercurialPools(res);
  //     });
  //   } catch (e) {
  //     console.error('Mercurial ERROR while obtaining pools info', e);
  //   }
  // }, [connection]);

  return (
    <PoolsContext.Provider
      value={{
        //raydiumPools,
        saberPools,
        //orcaPools,
        //mercurialPools,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
}

// export function useRaydiumPools() {
//   return useContext(PoolsContext)?.raydiumPools;
// }

export function useSaberPools() {
  return useContext(PoolsContext)?.saberPools;
}

// export function useOrcaPools() {
//   return useContext(PoolsContext)?.orcaPools;
// }

// export function useMercurialPools() {
//   return useContext(PoolsContext)?.mercurialPools;
// }

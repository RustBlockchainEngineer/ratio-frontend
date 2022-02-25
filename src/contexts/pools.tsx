import { Connection } from '@solana/web3.js';
import React, { useContext, useEffect, useState } from 'react';
import { getMercurialSwapPoolsInfo } from '../utils/mercurial-pools';
import { getOrcaSwapPoolInfo } from '../utils/orca-pools';
import { getRaydiumPools, getRaydiumPoolsInfo } from '../utils/ray-pools';
import { getSaberSwapPoolsInfo } from '../utils/saber-pools';
import { useConnection, useConnectionConfig } from './connection';

interface PoolsConfig {
  raydiumPools: any;
  saberPools: any;
  orcaPools: any;
  mercurialPools: any;
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

  const [raydiumPools, setRaydiumPools] = useState<any>(null);
  const [saberPools, setSaberPools] = useState<any>(null);
  const [orcaPools, setOrcaPools] = useState<any>(null);
  const [mercurialPools, setMercurialPools] = useState<any>(null);

  useEffect(() => {
    try {
      getRaydiumPools(connection).then((res: any) => {
        console.log('Loaded Raydium pools ***', res);
        setRaydiumPools(res);
      });
    } catch (e) {}
  }, [connection]);

  useEffect(() => {
    try {
      getSaberSwapPoolsInfo(connection, connectionConfig.env).then((res: any) => {
        console.log('Loaded Saber pools ***', res);
        setSaberPools(res);
      });
    } catch (e) {}
  }, [connection]);

  useEffect(() => {
    try {
      getOrcaSwapPoolInfo().then((res: any) => {
        console.log('Loaded Orca pools ***', res);
        setOrcaPools(res);
      });
    } catch (e) {
      console.error('ORCA ERROR while obtaining pools info', e);
    }
  }, [connection]);

  useEffect(() => {
    try {
      getMercurialSwapPoolsInfo().then((res: any) => {
        console.log('Loaded Mercurial pools ***', res);
        setMercurialPools(res);
      });
    } catch (e) {
      console.error('Mercurial ERROR while obtaining pools info', e);
    }
  }, [connection]);

  return (
    <PoolsContext.Provider
      value={{
        raydiumPools,
        saberPools,
        orcaPools,
        mercurialPools,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
}

export function useRaydiumPools() {
  return useContext(PoolsContext)?.raydiumPools;
}

export function useSaberPools() {
  return useContext(PoolsContext)?.saberPools;
}

export function useOrcaPools() {
  return useContext(PoolsContext)?.orcaPools;
}

export function useMercurialPools() {
  return useContext(PoolsContext)?.mercurialPools;
}

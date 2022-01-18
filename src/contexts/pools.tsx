import { Connection, PublicKey } from '@solana/web3.js';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { getMercurialSwapPoolsInfo } from '../utils/mercurial-pools';
import { getRaydiumPools } from '../utils/ray-pools';
import { getSaberSwapPoolsInfo } from '../utils/saber-pools';
import { getOrcaSwapPoolInfo } from '../utils/orca-pools';
import { ENDPOINTS, useConnection } from './connection';

interface PoolsConfig {
  pools: any;
}

const PoolsContext = React.createContext<PoolsConfig>({
  pools: {},
});

export function RaydiumPoolProvider({ children = undefined as any }) {
  const [pools, setPools] = useState<any>(null);
  const [conn, setConnection] = useState<Connection>(new Connection(ENDPOINTS[0].endpoint));
  useEffect(() => {
    try {
      getRaydiumPools(conn).then((res: any) => {
        setPools(res);
      });
    } catch (e) {}
  }, [conn]);

  return (
    <PoolsContext.Provider
      value={{
        pools,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
}

export function SaberPoolProvider({ children = undefined as any }) {
  const [pools, setPools] = useState<any>(null);
  const connection = useConnection();
  const swapA = new PublicKey('VeNkoB1HvSP6bSeGybQDnx9wTWFsQb2NBCemeCDSuKL');
  useEffect(() => {
    try {
      getSaberSwapPoolsInfo(connection, [swapA]).then((res: any) => {
        console.log('RESULT SUCCESSFULLY GETTED');
        console.log(res);
        console.log('-----------');
        setPools(res);
      });
    } catch (e) {
      console.log('ERROR');
      console.log(e);
    }
  }, [connection]);

  return (
    <PoolsContext.Provider
      value={{
        pools,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
}

export function MercurialPoolProvider({ children = undefined as any }) {
  const [pools, setPools] = useState<any>(null);
  useEffect(() => {
    try {
      getMercurialSwapPoolsInfo().then((res: any) => {
        console.log('MERCURIAL PROVIDER');
        console.log(res);
        setPools(res);
      });
    } catch (e) {
      console.log('MERCURIAL ERROR');
      console.log(e);
    }
  }, []);

  return (
    <PoolsContext.Provider
      value={{
        pools,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
}

export function OrcaPoolProvider({ children = undefined as any }) {
  const [pools, setPools] = useState<any>(null);
  const connection = useConnection();
  useEffect(() => {
    try {
      getOrcaSwapPoolInfo(connection).then((res: any) => {
        console.log('ORCA PROVIDER');
        console.log(res);
        setPools(res);
      });
    } catch (e) {
      console.log('ORCA ERROR');
      console.log(e);
    }
  }, [connection]);

  return (
    <PoolsContext.Provider
      value={{
        pools,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
}

export function useRaydiumPools() {
  return useContext(PoolsContext)?.pools;
}

export function useSaberPools() {
  return useContext(PoolsContext)?.pools;
}

export function useMercurialPools() {
  return useContext(PoolsContext)?.pools;
}

export function useOrcaPools() {
  return useContext(PoolsContext)?.pools;
}

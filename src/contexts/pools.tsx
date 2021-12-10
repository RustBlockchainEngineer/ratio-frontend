import { Connection } from '@solana/web3.js';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { getRaydiumPools } from '../utils/ray-pools';
import { ENDPOINTS } from './connection';

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

export function useRaydiumPools() {
  return useContext(PoolsContext)?.pools;
}

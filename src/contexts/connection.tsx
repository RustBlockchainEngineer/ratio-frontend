import { Account, Connection, ConnectionConfig as Web3ConnectionConfig } from '@solana/web3.js';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { cache } from './accounts';

type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export const SOLANA_CLUSTER: ENV = 'mainnet-beta';
export interface Rpc {
  name: string;
  url: string;
  weight: number;
}
const STRATEGY: 'speed' | 'weight' = 'speed';

const ENDPOINTS = [
  {
    name: 'Figment RPC',
    url: 'https://solana--mainnet.datahub.figment.io/apikey/45406ccdf5b28663e64c83b6806906d7',
    weight: 80,
  },
  {
    name: 'Project Serum RPC',
    url: 'https://solana-api.projectserum.com',
    weight: 10,
  },
  {
    name: 'Project Serum RPC',
    url: 'https://solana-api.tt-prod.net',
    weight: 10,
  },
];

interface ConnectionConfig {
  connection: Connection;
  endpoint: Rpc;
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  endpoint: null,
  connection: null,
});
async function getEpochInfo(rpcURL) {
  return axios.post(rpcURL, { jsonrpc: '2.0', id: 1, method: 'getEpochInfo' });
}
function getWeightEndpoint(endpoints: Rpc[]) {
  let pointer = 0;
  const random = Math.random() * 100;
  let lastEndpoint = endpoints[0];

  for (const endpoint of endpoints) {
    if (random > pointer + endpoint.weight) {
      pointer += pointer + endpoint.weight;
    } else if (random >= pointer && random < pointer + endpoint.weight) {
      lastEndpoint = endpoint;
      break;
    } else {
      lastEndpoint = endpoint;
      break;
    }
  }

  return lastEndpoint;
}

async function getFastEndpoint(endpoints: Rpc[]) {
  return await Promise.any(endpoints.map((endpoint) => getEpochInfo(endpoint.url).then(() => endpoint)));
}
async function getBestEndpoint(endpoints: Rpc[], strategy) {
  let endpoint;
  if (strategy === 'speed') {
    endpoint = await getFastEndpoint(endpoints);
  } else {
    endpoint = getWeightEndpoint(endpoints);
  }
  console.log('Best Endpoint is', endpoint.url);
  return endpoint;
}
export function ConnectionProvider({ children = undefined as any }) {
  const [endpoint, setEndpoint] = useState<Rpc>(null);

  useEffect(() => {
    getBestEndpoint(ENDPOINTS, STRATEGY).then((endpoint) => {
      setEndpoint(endpoint);
    });
  }, []);

  const web3ConnectionConfig: Web3ConnectionConfig = {
    commitment: 'confirmed',
  };
  const connection = useMemo(() => {
    if (endpoint) {
      return new Connection(endpoint.url, web3ConnectionConfig);
    } else {
      return null;
    }
  }, [endpoint]);

  useEffect(() => {
    cache.clear();
  }, [connection]);

  useEffect(() => {
    if (connection) {
      const id = connection.onAccountChange(new Account().publicKey, () => {});
      return () => {
        connection.removeAccountChangeListener(id);
      };
    }
  }, [connection]);

  useEffect(() => {
    if (connection) {
      const id = connection.onSlotChange(() => null);
      return () => {
        connection.removeSlotChangeListener(id);
      };
    }
  }, [connection]);

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        connection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return useContext(ConnectionContext).connection as Connection;
}

export function useRPCEndpoint() {
  const context = useContext(ConnectionContext);
  return context.endpoint ?? { url: '' };
}

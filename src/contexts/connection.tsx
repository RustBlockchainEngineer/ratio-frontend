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

const ENDPOINTS = [
  {
    name: 'Project Serum RPC' as ENV,
    url: 'https://solana-api.projectserum.com',
    weight: 100,
  },
  {
    name: 'Figment RPC' as ENV,
    url: 'https://solana--mainnet.datahub.figment.io/apikey/45406ccdf5b28663e64c83b6806906d7',
    weight: 100,
  },
  {
    name: 'Project Serum RPC' as ENV,
    url: 'https://solana-api.tt-prod.net',
    weight: 100,
  },
  {
    name: 'StableSwap RPC' as ENV,
    url: 'https://stableswap.rpcpool.com',
    weight: 100,
  },
];

const DEFAULT = ENDPOINTS[0];

interface ConnectionConfig {
  connection: Connection;
  endpoint: Rpc;
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  endpoint: DEFAULT,
  connection: new Connection(DEFAULT.url, 'recent'),
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

export function ConnectionProvider({ children = undefined as any }) {
  const strategy = 'speed';
  const [endpoint, setEndpoint] = useState<Rpc>(DEFAULT);

  useEffect(() => {
    if (strategy === 'speed') {
      getFastEndpoint(ENDPOINTS).then((endpoint) => {
        console.log('Finding fast one', endpoint);
        setEndpoint(endpoint);
      });
    } else {
      setEndpoint(getWeightEndpoint(ENDPOINTS));
    }
  }, []);

  const web3ConnectionConfig: Web3ConnectionConfig = {
    commitment: 'confirmed',
  };
  const connection = useMemo(() => new Connection(endpoint.url, web3ConnectionConfig), [endpoint]);

  useEffect(() => {
    cache.clear();
  }, [connection]);

  // The websocket library solana/web3.js uses closes its websocket connection when the subscription list
  // is empty after opening its first time, preventing subsequent subscriptions from receiving responses.
  // This is a hack to prevent the list from every getting empty
  useEffect(() => {
    const id = connection.onAccountChange(new Account().publicKey, () => {});
    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [connection]);

  useEffect(() => {
    const id = connection.onSlotChange(() => null);
    return () => {
      connection.removeSlotChangeListener(id);
    };
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
  return context.endpoint;
}

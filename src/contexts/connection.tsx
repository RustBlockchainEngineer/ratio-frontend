import Axios from 'axios';
import {
  Account,
  clusterApiUrl,
  Connection,
  Transaction,
  TransactionInstruction,
  ConnectionConfig as Web3ConnectionConfig,
} from '@solana/web3.js';
import React, { useContext, useEffect, useMemo } from 'react';
import { tokenAuthFetchMiddleware } from '@strata-foundation/web3-token-auth';
import { ENV as ChainID } from '@solana/spl-token-registry';

import { useLocalStorageState } from '../utils/utils';
import { notify } from '../utils/notifications';
import { setProgramIds } from '../utils/ids';
import { WalletAdapter } from './wallet';
import { cache } from './accounts';
import { API_ENDPOINT } from '../constants';

export type ENV = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export const ENDPOINTS = [
  {
    name: 'mainnet-beta' as ENV,
    endpoint: 'https://ratio.genesysgo.net/',
    chainID: ChainID.MainnetBeta,
  },
  {
    name: 'testnet' as ENV,
    endpoint: clusterApiUrl('testnet'),
    chainID: ChainID.Testnet,
  },
  {
    name: 'devnet' as ENV,
    endpoint: 'https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/',
    // endpoint: clusterApiUrl('devnet'),
    chainID: ChainID.Devnet,
  },
  {
    name: 'localnet' as ENV,
    endpoint: 'http://127.0.0.1:8899',
    chainID: ChainID.Devnet,
  },
];

const DEFAULT = ENDPOINTS[0];
const DEFAULT_SLIPPAGE = 0.25;

interface ConnectionConfig {
  connection: Connection;
  sendConnection: Connection;
  endpoint: string;
  slippage: number;
  setSlippage: (val: number) => void;
  env: ENV;
  setEndpoint: (val: string) => void;
}

const ConnectionContext = React.createContext<ConnectionConfig>({
  endpoint: DEFAULT.endpoint,
  setEndpoint: () => {},
  slippage: DEFAULT_SLIPPAGE,
  // eslint-disable-next-line
  setSlippage: (val: number) => {},
  // eslint-disable-next-line
  connection: new Connection(DEFAULT.endpoint, 'recent'),
  sendConnection: new Connection(DEFAULT.endpoint, 'recent'),
  env: DEFAULT.name,
});

const getRpcAuthToken = async () => {
  const url = new URL('rpcauth/get-token', API_ENDPOINT);
  const resp = await Axios.post(url.toString());
  const { access_token }: { access_token: string } = resp.data;
  return access_token;
};
/*    | 'processed'
    | 'confirmed'
    | 'finalized'
    | 'recent'
    | 'single'
    | 'singleGossip'
    | 'root'
    | 'max';*/
export function ConnectionProvider({ children = undefined as any }) {
  const [endpoint, setEndpoint] = useLocalStorageState('connectionEndpts', DEFAULT.endpoint);

  const [slippage, setSlippage] = useLocalStorageState('slippage', DEFAULT_SLIPPAGE.toString());

  const web3ConnectionConfig: Web3ConnectionConfig = {
    commitment: 'confirmed', // TODO: Set to "confirmed"?
    fetchMiddleware: tokenAuthFetchMiddleware({
      getToken: getRpcAuthToken,
    }),
  };
  const connection = useMemo(() => new Connection(endpoint, web3ConnectionConfig), [endpoint]);
  const sendConnection = useMemo(() => new Connection(endpoint, web3ConnectionConfig), [endpoint]);

  const chain = ENDPOINTS.find((end) => end.endpoint === endpoint) || DEFAULT;
  const env = chain.name;

  useEffect(() => {
    cache.clear();
  }, [connection, chain]);

  setProgramIds(env);

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

  useEffect(() => {
    const id = sendConnection.onAccountChange(new Account().publicKey, () => {});
    return () => {
      sendConnection.removeAccountChangeListener(id);
    };
  }, [sendConnection]);

  useEffect(() => {
    const id = sendConnection.onSlotChange(() => null);
    return () => {
      sendConnection.removeSlotChangeListener(id);
    };
  }, [sendConnection]);

  return (
    <ConnectionContext.Provider
      value={{
        endpoint,
        setEndpoint,
        slippage: parseFloat(slippage),
        setSlippage: (val) => setSlippage(val.toString()),
        connection,
        sendConnection,
        env,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return useContext(ConnectionContext).connection as Connection;
}

export function useSendConnection() {
  return useContext(ConnectionContext)?.sendConnection;
}

export function useConnectionConfig() {
  const context = useContext(ConnectionContext);
  return {
    endpoint: context.endpoint,
    setEndpoint: context.setEndpoint,
    env: context.env,
    // tokens: context.tokens,
    // tokenMap: context.tokenMap,
  };
}

export function useSlippageConfig() {
  const { slippage, setSlippage } = useContext(ConnectionContext);
  return { slippage, setSlippage };
}

const getErrorForTransaction = async (connection: Connection, txid: string) => {
  // wait for all confirmation before geting transaction
  await connection.confirmTransaction(txid, 'max');

  const tx = await connection.getParsedConfirmedTransaction(txid);

  const errors: string[] = [];
  if (tx?.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach((log) => {
      const regex = /Error: (.*)/gm;
      let m;
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m.length > 1) {
          errors.push(m[1]);
        }
      }
    });
  }

  return errors;
};

export const sendTransaction = async (
  connection: Connection,
  wallet: WalletAdapter,
  instructions: TransactionInstruction[],
  signers: Account[],
  awaitConfirmation = true
) => {
  if (!wallet?.publicKey) {
    throw new Error('Wallet is not connected');
  }

  let transaction = new Transaction();
  instructions.forEach((instruction) => transaction.add(instruction));
  transaction.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash;
  transaction.setSigners(
    // fee payied by the wallet owner
    wallet.publicKey,
    ...signers.map((s) => s.publicKey)
  );
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  transaction = await wallet.signTransaction(transaction);
  const rawTransaction = transaction.serialize();
  const options = {
    skipPreflight: true,
    commitment: 'singleGossip',
  };

  const txid = await connection.sendRawTransaction(rawTransaction, options);

  if (awaitConfirmation) {
    const status = (await connection.confirmTransaction(txid, options && (options.commitment as any))).value;

    if (status?.err) {
      const errors = await getErrorForTransaction(connection, txid);
      notify({
        message: 'Transaction failed...',
        description: (
          <>
            {errors.map((err) => (
              <div>{err}</div>
            ))}
            {/* <ExplorerLink address={txid} type="transaction" /> */}
          </>
        ),
        type: 'error',
      });

      throw new Error(`Raw transaction ${txid} failed (${JSON.stringify(status)})`);
    }
  }

  return txid;
};

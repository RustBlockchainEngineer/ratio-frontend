/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINT } from '../constants/constants';
import { useConnectionConfig } from '../contexts/connection';

function makeRatioApiEndpointTxSignature(walletId: string, txSignature: string): string {
  return `${API_ENDPOINT}/transaction/${walletId}/${txSignature}`;
}

function makeRatioApiEndpointTxHistory(walletId: string, addressId: string): string {
  return `${API_ENDPOINT}/transaction/${walletId}/detail/${addressId}`;
}

function makeSolanaExplorerLink(txSignature: string, cluster = 'devnet'): string {
  return `https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`;
}

function formatDate(timestamp = ''): string {
  const date = new Date(parseInt(timestamp));
  const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  const timeDate = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return formatDate + ' ' + timeDate;
}

function formatTxHistory(transactions: [], cluster: string): void[] {
  const formattedTxs = transactions.map((tx: any) => {
    const txData: {
      [k: string]: any;
    } = {};
    txData['date'] = formatDate(tx?.transaction_dt);
    txData['txType'] = tx?.transaction_type;
    txData['status'] = tx?.status;
    txData['txSignature'] = makeSolanaExplorerLink(tx?.transaction_id, cluster);
  });
  return formattedTxs;
}

export function useFetchVaultTxRatioApi(walletId = '', txSignature: string, authToken: any) {
  const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelRequest = false;
    async function fetchTxData() {
      try {
        const endpoint = makeRatioApiEndpointTxSignature(walletId, txSignature);
        const res = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(authToken),
          },
          method: 'GET',
        });
        const result = await res.json();
        if (cancelRequest) return;
        setResult(result);
      } catch (error) {
        if (cancelRequest) return;
        setError(cancelRequest);
      }
    }

    fetchTxData();

    return function cleanup() {
      cancelRequest = true;
    };
  }, [authToken]);

  return [result, error];
}

// {{base_url}}/transaction/:wallet_id/detail/:address_id
export function useFetchVaultTxHistoryRatioApi(walletId = '', mintAddress: string, authToken: any) {
  const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
  const [error, setError] = useState<any>(null);
  const cluster = useConnectionConfig()?.env;

  useEffect(() => {
    let cancelRequest = false;
    async function fetchUserTxHistory() {
      try {
        const endpoint = makeRatioApiEndpointTxHistory(walletId, mintAddress);
        const res = await fetch(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(authToken),
          },
          method: 'GET',
        });
        const result = await res.json();
        if (cancelRequest) return;
        const formattedTxData = formatTxHistory(result, cluster);
        setResult(formattedTxData);
      } catch (error) {
        if (cancelRequest) return;
        setError(cancelRequest);
      }
    }

    fetchUserTxHistory();

    return function cleanup() {
      cancelRequest = true;
    };
  }, []);

  return [result, error];
}

/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINT } from '../constants/constants';

function makeRatioApiEndpointTxSignature(walletId: string, txSignature: string) : string {
    return `${API_ENDPOINT}/transaction/${walletId}/${txSignature}`;
}

function makeRatioApiEndpointTxHistory(walletId: string) : string {
    return `${API_ENDPOINT}/transaction/${walletId}`;
}

// /transaction/:wallet_id/:signature
export function useFetchVaultTxRatioApi(walletId = '', txSignature: string, authToken: any){
    const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let cancelRequest = false;
        async function fetchTxData(){
            try {
                const endpoint = makeRatioApiEndpointTxSignature(walletId,txSignature);
                const res = await fetch(endpoint,{
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': JSON.stringify(authToken),
                      },
                      method: 'GET',
                });
                const result = await res.json();
                if(cancelRequest) return;
                setResult(result);
            } catch (error) {
                if(cancelRequest) return;
                setError(cancelRequest);
            }
        }

        fetchTxData();

        return function cleanup() {
            cancelRequest = true;
        };

    },[authToken]);

    return [result,error];

}

// /transaction/:wallet_id
export function useFetchVaultTxHistoryRatioApi(walletId: string, authToken: any){
    const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let cancelRequest = false;
        async function fetchUserTxHistory(){
            try {
                const endpoint = makeRatioApiEndpointTxHistory(walletId);
                const res = await fetch(endpoint,{
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': JSON.stringify(authToken),
                      },
                      method: 'GET',
                });
                const result = await res.json();
                if(cancelRequest) return;
                setResult(result);
            } catch (error) {
                if(cancelRequest) return;
                setError(cancelRequest);
            }
        }

        fetchUserTxHistory();

        return function cleanup() {
            cancelRequest = true;
        };

    },[]);

    return [result,error];

}
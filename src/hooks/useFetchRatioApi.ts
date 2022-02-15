/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINT } from '../constants/constants';

// /transaction/:wallet_id/:signature
function makeRatioApiEndpointTxSignature(walletId: string, txSignature: string) : string {
    return `${API_ENDPOINT}/transaction/${walletId}/${txSignature}`;
}

// {{base_url}}/transaction/:wallet_id/detail/:address_id
/** 
[
    {
            "transaction_id": string,
            "wallet_address_id": string,
            "address_id": string,
            "amount": number,
            "transaction_type": TRANS_TYPE,
            "transaction_dt": timestamp,
            "sawp_group": string,
            "conversion_rate": number,
            "base_address_id": string
        },...
]
**/
function makeRatioApiEndpointTxHistory(walletId: string, addressId: string) : string {
    return `${API_ENDPOINT}/transaction/${walletId}/detail/${addressId}`;
}

function makeSolanaExplorerLink(txSignature: string, cluster: string) : string {
    return `https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`;
}


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
export function useFetchVaultTxHistoryRatioApi(walletId: string, mintAddress: string, authToken: any){
    const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let cancelRequest = false;
        async function fetchUserTxHistory(){
            try {
                const endpoint = makeRatioApiEndpointTxHistory(walletId,mintAddress);
                const res = await fetch(endpoint,{
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': JSON.stringify(authToken),
                      },
                      method: 'GET',
                });
                const result = await res.json();
                console.log('RESULT');
                console.log(result);
                if(cancelRequest) return;
                setResult({

                });
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
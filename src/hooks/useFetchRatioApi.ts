/* eslint-disable prettier/prettier */
import { useEffect, useMemo, useState } from 'react';
import { getFromRatioApi } from '../utils/ratioApi';
import { API_ENDPOINT } from '../constants/constants';

function makeRatioApiEndpoint(route: string) : string {
    return `${API_ENDPOINT}${route}`;
}

export function useFetchVaultTxHistoryRatioApi(user: string ,data = {}, route : string, authToken: any){
    const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        let cancelRequest = false;
        async function fetchUserTxHistory(){
            try {
                const endpoint = makeRatioApiEndpoint(route);
                const res = await fetch(endpoint,{
                    body: JSON.stringify({user: user}),
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
    },[]);


    return [result,error];

}
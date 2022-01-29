/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { jupiterApi } from '../utils/jupiter/constants';

interface JupiterRoutePrice {
    startPlatform: string,
    endPlatform: string,
    price: string,
    priceWithSlippage: string,
    priceImpactPct: string,
}

/**
 * @param inputMint : The address of the input mint token
 * @param outputMint : The address of the output mint token
 * @param amount : amount to exchange. It defaults to one SOL because the main goal of the function is to get the unitary price.
 * @param slippage : Slippage. It defaults to 0.5%.
 * @returns : JupiterRoutePrice interface.
 */
export function useJupiterRoute( inputMint: string, outputMint: string, amount = '1000000000', slippage = 0.5 ){
    const [result, setResult] = useState<any>({data: 'DATA NOT LOADED YET'});
    const [error, setError] = useState<any>(null);

    const endpoint = `${jupiterApi}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippage=${slippage}`;

    useEffect(() => {
        async function fetchJupiterRoute() {
            try{
                const response = await fetch(
                    endpoint
                );
                const bestRoute = (await response.json()).data[0];
                const markets = bestRoute.marketInfos;
                const res = {
                    startPlatform: markets[0].label,
                    endPlatform: markets[markets.length - 1].label,
                    price: bestRoute.outAmount ,
                    priceWithSlippage: bestRoute.outAmountWithSlippage ,
                    priceImpactPct: bestRoute.priceImpactPct ,
                }
                setResult(res);
            }catch(error){
                setError(error);
            }
        }
        fetchJupiterRoute();
    },[]);

    return [result,error];
}
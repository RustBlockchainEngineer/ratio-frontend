/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { JUPITER_API } from '../utils/jupiter/constants';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/dynamic'
import { useRatioPriceFetchingFrequency } from './useRatioPriceFetchingFrequency';

interface JupiterRoutePrice {
  startPlatform: string;
  endPlatform: string;
  price: string;
  priceWithSlippage: string;
  priceImpactPct: string;
}

function makeJupiterEndpoint(inputMint: string, outputMint: string, amount: string, slippage: number):string{
  return `${JUPITER_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippage=${slippage}`;
}


async function getJupiterRoute(endpoint: string){
  let res;
  try {
    const response = await fetch(endpoint);
    const bestRoute = (await response.json())?.data[0];
    const markets = bestRoute?.marketInfos;
    res = {
      startPlatform: markets[0]?.label,
      endPlatform: markets[markets.length - 1]?.label,
      price: bestRoute?.outAmount,
      priceWithSlippage: bestRoute?.outAmountWithSlippage,
      priceImpactPct: bestRoute?.priceImpactPct,
    };
  } catch (error) {
    throw await error;
  }
  return res;
}

/**
 * @param inputMint : The address of the input mint token
 * @param outputMint : The address of the output mint token
 * @param amount : amount to exchange. It defaults to one SOL because the main goal of the function is to get the unitary price.
 * @param slippage : Slippage. It defaults to 0.5%.
 * @returns : JupiterRoutePrice interface.
 */
export function useJupiterRoute(inputMint: string, outputMint: string, amount = '1000000000', slippage = 0.5) {
  const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
  const [error, setError] = useState<any>(null);

  const endpoint = makeJupiterEndpoint(inputMint,outputMint,amount,slippage);

  useEffect(() => {
    let cancelRequest = false;
    async function fetchJupiterRoute() {
      try {
        const res = await getJupiterRoute(endpoint);
        if (cancelRequest) return;
        setResult(res);
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
      }
    }
    fetchJupiterRoute();

    return function cleanup() {
      cancelRequest = true;
    };
  }, [endpoint]);

  return [result, error];
}

/**
 * Same function as before but with frequency enabled.
 * @returns : JupiterRoutePrice interface.
 */
export function useJupiterPriceWithFrequency(inputMint: string, outputMint: string, amount = '1000000000', slippage = 0.5){
  const [result,setResult] = useState<any>({data: 'DATA NOT LOADED YET'});
  const [error, setError] = useState<any>(null);
  const data = useRatioPriceFetchingFrequency();
  let priceIntervalFrequency: number;

  if(data[1] === null){
    priceIntervalFrequency = data[0];
  }

  const endpoint = `${JUPITER_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippage=${slippage}`;

  useEffect(() => {
    let cancelRequest = false;
    async function fetchJupiterRoute(){
    try {
      const intervalID = setIntervalAsync(async() => {
          const res = await getJupiterRoute(endpoint); 
          if(cancelRequest) return;
          setResult(res);
        }, !isNaN(priceIntervalFrequency) ? priceIntervalFrequency * 1000 : 10000)
        /**
         * TO DISCUSS (WITH MARIAN)
         * The behaviour of this clearInterval will make to stop the polling.
         * My opinion is to not use it.
         * await clearIntervalAsync(intervalID);
         * */
      } catch (error) {
        if(cancelRequest) return;
        setError(error);
      }
    }

    fetchJupiterRoute();

    return function cleanup() {
      cancelRequest = true;
    };

  });

  return [result,error];
}
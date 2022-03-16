import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';
import { FetchingStatus } from '../types/fetching-types';

interface SaberLpPrices {
  poolName: string;
  tokenASize: string;
  tokenBSize: string;
  lpPrice: string;
  tokenAPrice: number;
  tokenBPrice: number;
}

function makeRatioApiEndpointSaberLpPrices(): string {
  return `${API_ENDPOINT}/saberlpprices`;
}

function makeRatioApiEndpointSaberLpPrice(poolName: string): string {
  return `${API_ENDPOINT}/saberlpprices/${poolName}`;
}

export const useFetchSaberLpPrices = () => {
  const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.NotAsked);
  const [lpPrices, setLpPrices] = useState<Array<SaberLpPrices>>([]);
  const [error, setError] = useState<any>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    async function getLpPrices() {
      try {
        const res = await fetch(makeRatioApiEndpointSaberLpPrices(), {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });
        if (!res.ok) {
          setStatus(FetchingStatus.Error);
          setError('There was an error on the server side: ' + (await res.json()));
          return;
        }
        setStatus(FetchingStatus.Loading);
        const tokenPrice = await res.json();
        if (cancelRequest) return;
        setLpPrices(tokenPrice);
        setStatus(FetchingStatus.Finish);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setStatus(FetchingStatus.Error);
        setError(error);
      }
    }

    getLpPrices();
    return function cleanup() {
      cancelRequest = true;
    };
  }, []);

  return {
    lpPrices,
    status,
    error,
  };
};

export const useFetchSaberLpPrice = async (poolName: string) => {
  const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.NotAsked);
  const [lpPrice, setLpPrice] = useState<SaberLpPrices>();
  const [error, setError] = useState<any>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    async function getLpPrice() {
      try {
        const res = await fetch(makeRatioApiEndpointSaberLpPrice(poolName), {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });
        setStatus(FetchingStatus.Loading);
        if (!res.ok) {
          setStatus(FetchingStatus.Error);
          setError('There was an error on the server side: ' + (await res.json()));
          return;
        }
        const tokenPrices = await res.json();
        if (cancelRequest) return;
        setLpPrice(tokenPrices);
        setStatus(FetchingStatus.Finish);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setStatus(FetchingStatus.Error);
        setError(error);
      }
    }

    getLpPrice();
    return function cleanup() {
      cancelRequest = true;
    };
  }, [poolName]);

  return {
    lpPrice,
    status,
    error,
  };
};

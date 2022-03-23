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
  const [error, setError] = useState<Maybe<Error>>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    const getLpPrices = async () => {
      try {
        setStatus(FetchingStatus.Loading);
        const res = await fetch(makeRatioApiEndpointSaberLpPrices(), {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          setStatus(FetchingStatus.Error);
          setError(new Error(`There was an error on the server side: ${errorResponse}`));
          return;
        }

        const tokenPrice = await res.json();

        if (cancelRequest) return;
        setLpPrices(tokenPrice);
        setStatus(FetchingStatus.Finish);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setLpPrices([]);
        setStatus(FetchingStatus.Error);
        setError(error);
      }
    };

    getLpPrices();
    return () => {
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
  const [lpPrice, setLpPrice] = useState<Maybe<SaberLpPrices>>(null);
  const [error, setError] = useState<Maybe<Error>>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    const getLpPrice = async () => {
      try {
        setStatus(FetchingStatus.Loading);
        const res = await fetch(makeRatioApiEndpointSaberLpPrice(poolName), {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });
        if (!res.ok) {
          const errorResponse = await res.json();
          setStatus(FetchingStatus.Error);
          setError(new Error(`There was an error on the server side: ${errorResponse}`));
          return;
        }
        const tokenPrice = await res.json();
        if (cancelRequest) return;
        setLpPrice(tokenPrice);
        setStatus(FetchingStatus.Finish);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setLpPrice(null);
        setStatus(FetchingStatus.Error);
        setError(error);
      }
    };

    getLpPrice();
    return () => {
      cancelRequest = true;
    };
  }, [poolName]);

  return {
    lpPrice,
    status,
    error,
  };
};

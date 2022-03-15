import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';

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
  const [status, setStatus] = useState<any>('Data not loaded yet');
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
        const tokenPrice = await res.json();
        if (cancelRequest) return;
        setLpPrices(tokenPrice);
        setStatus('Data loaded successfully');
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setStatus('ERROR FETCHING SABER LP PRICES');
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
  const [status, setStatus] = useState<any>('Data not loaded yet');
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
        const tokenPrices = await res.json();
        if (cancelRequest) return;
        setLpPrice(tokenPrices);
        setStatus('Data loaded successfully');
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setStatus('ERROR FETCHING SABER LP PRICES');
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

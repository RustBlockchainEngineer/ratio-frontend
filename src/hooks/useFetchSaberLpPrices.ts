import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';

interface SaberLpPrices {
  poolName: string;
  lpPrice: string;
}

function makeRatioApiEndpointSaberLpPrices(): string {
  return `${API_ENDPOINT}/saberlpprices`;
}

export const useFetchSaberLpPrices = () => {
  // eslint-disable-next-line
  const [status, setStatus] = useState<any>('Data not loaded yet');
  const [lpPrices, setLpPrices] = useState<[SaberLpPrices]>();
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
        const tokenPrices = await res.json();
        if (cancelRequest) return;
        setLpPrices(tokenPrices);
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
    error,
  };
};

export const useFetchSaberLpPrice = async () => {};

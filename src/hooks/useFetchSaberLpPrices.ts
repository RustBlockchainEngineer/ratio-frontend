import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';

function makeRatioApiEndpointSaberLpPrices(): string {
  return `${API_ENDPOINT}/saberlpprices`;
}

export const useFetchSaberLpPrices = () => {
  const [lpPrices, setLpPrices] = useState<any>({ DATA: 'DATA NOT LOADED YET' });
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
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
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

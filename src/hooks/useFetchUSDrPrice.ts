import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';

function makeRatioApiEndpointSaberUsdrPrice(): string {
  return `${API_ENDPOINT}/saberlpprices/usdrprice`;
}

export const useFetchSaberUsdrPrice = () => {
  const [status, setStatus] = useState<any>('Data not loaded yet');
  const [usdrPrice, setUsdrPrice] = useState<string>();
  const [error, setError] = useState<any>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    async function getUsdrPrice() {
      try {
        const res = await fetch(makeRatioApiEndpointSaberUsdrPrice(), {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });
        const usdrPrice = await res.json();
        if (cancelRequest) return;
        setUsdrPrice(usdrPrice);
        setStatus('Data loaded successfully');
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setStatus('ERROR FETCHING SABER LP PRICES');
        setError(error);
      }
    }

    getUsdrPrice();
    return function cleanup() {
      cancelRequest = true;
    };
  }, []);

  return {
    usdrPrice,
    status,
    error,
  };
};

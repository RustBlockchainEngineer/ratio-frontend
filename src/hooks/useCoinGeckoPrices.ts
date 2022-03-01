import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';

function makeRatioApiEndpointCoinGecko(): string {
  return `${API_ENDPOINT}/coingecko`;
}

function makeRatioApiEndpointCoinGeckoSimplePrice(coinId: string): string {
  return `${API_ENDPOINT}/coingecko/${coinId}`;
}

export const useCoinGeckoPrice = (coinId: string) => {
  const [price, setPrice] = useState<any>({ DATA: 'DATA NOT LOADED YET' });
  const [error, setError] = useState<any>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    async function getUSDPrice() {
      try {
        const res = await fetch(makeRatioApiEndpointCoinGeckoSimplePrice(coinId), {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });
        const tokenPrice = await res.json();
        if (cancelRequest) return;
        setPrice(tokenPrice);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
      }
    }

    getUSDPrice();
    return function cleanup() {
      cancelRequest = true;
    };
  }, [coinId]);
};

export const useCoinGeckoPrices = () => {
  const [prices, setPrices] = useState<any>({ DATA: 'DATA NOT LOADED YET' });
  const [error, setError] = useState<any>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    async function getUSDPrices() {
      try {
        const res = await fetch(makeRatioApiEndpointCoinGecko(), {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });
        const tokenPrices = await res.json();
        if (cancelRequest) return;
        setPrices(tokenPrices);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
      }
    }

    getUSDPrices();
    return function cleanup() {
      cancelRequest = true;
    };
  }, []);

  return {
    prices,
    error,
  };
};

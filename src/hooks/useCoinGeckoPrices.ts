import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';
import { FetchingStatus } from '../types/fetching-types';

function makeRatioApiEndpointCoinGecko(): string {
  return `${API_ENDPOINT}/coingecko`;
}

function makeRatioApiEndpointCoinGeckoSimplePrice(coinId: string): string {
  return `${API_ENDPOINT}/coingecko/${coinId}`;
}

function makeRatioApiEndpointSaberPrice(): string {
  return `${API_ENDPOINT}/coingecko/saberprice`;
}

export const useCoinGeckoPrice = (coinId: string) => {
  const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.NotAsked);
  const [price, setPrice] = useState<any>();
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
        setStatus(FetchingStatus.Loading);
        if (!res.ok) {
          setStatus(FetchingStatus.Error);
          setError('There was an error on the server side: ' + (await res.json()));
          return;
        }
        const tokenPrice = await res.json();
        if (cancelRequest) return;
        setPrice(tokenPrice);
        setStatus(FetchingStatus.Finish);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
        setStatus(FetchingStatus.Error);
      }
    }

    getUSDPrice();
    return function cleanup() {
      cancelRequest = true;
    };
  }, [coinId]);

  return {
    price,
    status,
    error,
  };
};

export const useCoinGeckoPrices = () => {
  const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.NotAsked);
  const [prices, setPrices] = useState<any>();
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
        setStatus(FetchingStatus.Loading);
        if (!res.ok) {
          setStatus(FetchingStatus.Error);
          setError('There was an error on the server side: ' + (await res.json()));
          return;
        }
        const tokenPrices = await res.json();
        if (cancelRequest) return;
        setPrices(tokenPrices);
        setStatus(FetchingStatus.Finish);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
        setStatus(FetchingStatus.Error);
      }
    }

    getUSDPrices();
    return function cleanup() {
      cancelRequest = true;
    };
  }, []);

  return {
    prices,
    status,
    error,
  };
};

export const useFetchSaberPrice = () => {
  const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.NotAsked);
  const [saberPrice, setSaberPrice] = useState<any>();
  const [error, setError] = useState<any>(null);
  const { accessToken } = useAuthContextProvider();

  useEffect(() => {
    let cancelRequest = false;
    async function getSaberPrice() {
      try {
        const res = await fetch(makeRatioApiEndpointSaberPrice(), {
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
        const price = await res.json();
        if (cancelRequest) return;
        setSaberPrice(price?.saber?.usd);
        setStatus(FetchingStatus.Finish);
        setError(null);
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
        setStatus(FetchingStatus.Error);
      }
    }

    getSaberPrice();
    return function cleanup() {
      cancelRequest = true;
    };
  }, []);

  return {
    saberPrice,
    status,
    error,
  };
};

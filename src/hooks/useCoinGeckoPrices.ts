import { useEffect, useState } from 'react';
import { getCoinGeckoPrices } from '../utils/coingecko';

export const useCoinGeckoPrices = () => {
  const [prices, setPrices] = useState<any>({ DATA: 'DATA NOT LOADED YET' });
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let cancelRequest = false;
    async function getUSDPrice() {
      try {
        const tokenPrices = await getCoinGeckoPrices();
        if (cancelRequest) return;
        setPrices(tokenPrices);
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
  }, []);

  return {
    prices,
    error,
  };
};

/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { useAuthContextProvider } from '../contexts/authAPI';
import { API_ENDPOINT } from '../constants';

/**
 * Function to fetch price_interval time for fetching jupiter prices.
 * @returns frequency in seconds for price fetching interval.
 */
export function useRatioPriceFetchingFrequency() {
  const [frequency, setFrequency] = useState<any>({ data: 'DATA NOT LOADED YET' });
  const [error, setError] = useState<any>(null);

  //Get the access token to fetch data from the Ratio API
  const { accessToken } = useAuthContextProvider();

  const endpoint = `${API_ENDPOINT}/ratioconfig/general`;

  useEffect(() => {
    let cancelRequest = false;
    async function fetchFrequency() {
      try {
        const response = await fetch(endpoint, {
          body: JSON.stringify({ accessToken }),
        });
        const data = await response.json();
        /**
         * The api returns the following:
         * data[0]: max_usd
         * data[1]: max_usdr
         * data[2]: price_interval
         */
        if (data[2] === undefined) {
          setError('UNABLE TO FETCH PRICE INTERVAL');
        } else {
          const res = parseInt(data[2]?.price_interval);
          if (cancelRequest) return;
          setFrequency(res);
        }
      } catch (error) {
        if (cancelRequest) return;
        setError(error);
      }
    }

    fetchFrequency();

    return function cleanup() {
      cancelRequest = true;
    };
  }, [endpoint]);

  return [frequency, error];
}

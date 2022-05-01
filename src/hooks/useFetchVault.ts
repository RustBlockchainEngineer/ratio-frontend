import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';

const cache: {
  [key: string]: any;
} = {};

export const useFetchVault = (mint: string) => {
  //zhao made
  const alterMint =
    mint === '2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf' ? '7gJWEW3vGDgUNbg3agG9DSSkb271tpk82K4ixAGXeuoh' : mint;
  const [vault, setVault] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const url = `${API_ENDPOINT}/lpairs/${alterMint}`;
      let data = null;

      if (cache[url]) {
        data = cache[url];
      } else {
        const response = await fetch(url);
        data = await response.json();
        cache[url] = data;
      }
      return data;
    };

    fetchData().then((data) => {
      setVault(data);
    });
  }, [mint]);

  return vault;
};

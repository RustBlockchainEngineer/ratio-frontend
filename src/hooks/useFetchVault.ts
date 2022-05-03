import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';

const cache: {
  [key: string]: any;
} = {};

export const useFetchVault = (mint: string) => {
  const [vault, setVault] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const url = `${API_ENDPOINT}/lpairs/${mint}`;
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

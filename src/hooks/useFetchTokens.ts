import { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { Token } from '../types/VaultTypes';
import { FetchingStatus } from '../types/fetching-types';

export const useFetchTokens = () => {
  const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.NotAsked);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [error, setError] = useState<Maybe<Error>>(null);

  useEffect(() => {
    let cancelRequest = false;

    const fetchTokens = async () => {
      try {
        setStatus(FetchingStatus.Loading);

        const response = await fetch(`${API_ENDPOINT}/tokens`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        });

        if (response.ok) {
          const tokens = await response.json();
          if (cancelRequest) return;
          setTokens(tokens);
          setStatus(FetchingStatus.Finish);
        } else {
          throw new Error('There was an error in obtaining the tokens');
        }
      } catch (err) {
        if (cancelRequest) return;
        setError(err);
        setStatus(FetchingStatus.Error);
      }
    };

    fetchTokens();

    return () => {
      cancelRequest = true;
    };
  }, []);

  return {
    tokens,
    status,
    error,
  };
};

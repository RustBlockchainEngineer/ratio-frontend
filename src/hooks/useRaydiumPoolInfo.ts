import { useEffect, useState } from 'react';
import { useConnection } from '../contexts/connection';
import { getRaydiumPoolsInfo } from '../utils/ray-pools';

//This custom hook allows to get the pools information for the Raydium platform.
export const useRaydiumPoolsInfo = () => {
  const [pools, setPools] = useState<any>(null);
  const connection = useConnection();
  useEffect(() => {
    try {
      getRaydiumPoolsInfo().then((res: any) => {
        setPools(res);
      });
    } catch (e) {
      console.error('Raydium ERROR while obtaining pools info', e);
    }
  }, [connection]);

  return {
    pools,
  };
};

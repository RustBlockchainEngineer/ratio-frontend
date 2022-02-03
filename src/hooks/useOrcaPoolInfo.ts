import { useEffect, useState } from 'react';
import { useConnection } from '../contexts/connection';
import { getOrcaSwapPoolInfo } from '../utils/orca-pools';

//This custom hook allows to get the pools information for the Orca platform.
export const useOrcaPoolsInfo = () => {
  const [pools, setPools] = useState<any>(null);
  const connection = useConnection();
  useEffect(() => {
    try {
      getOrcaSwapPoolInfo().then((res: any) => {
        setPools(res);
      });
    } catch (e) {
      console.error('ORCA ERROR while obtaining pools info', e);
    }
  }, [connection]);

  return {
    pools,
  };
};

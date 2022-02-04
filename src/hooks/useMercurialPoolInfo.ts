import { useEffect, useState } from 'react';
import { useConnection } from '../contexts/connection';
import { getMercurialSwapPoolsInfo } from '../utils/mercurial-pools';

//This custom hook allows to get the pools information for the Mercurial platform.
export const useMercurialPoolsInfo = () => {
  const [pools, setPools] = useState<any>(null);
  const connection = useConnection();
  useEffect(() => {
    try {
      getMercurialSwapPoolsInfo().then((res: any) => {
        setPools(res);
      });
    } catch (e) {
      console.error('Mercurial ERROR while obtaining pools info', e);
    }
  }, [connection]);

  return {
    pools,
  };
};

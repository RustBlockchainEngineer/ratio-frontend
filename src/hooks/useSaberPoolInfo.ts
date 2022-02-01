import { useEffect, useState } from 'react';
import { useConnection, useConnectionConfig } from '../contexts/connection';
import { getSaberSwapPoolsInfo } from '../utils/saber-pools';

//This custom hook allows to get the pools information for the Saber platform.
export const useSaberPoolsInfo = () => {
  const [pools, setPools] = useState<any>(null);
  const connection = useConnection();
  const connectionConfig = useConnectionConfig();
  useEffect(() => {
    try {
      getSaberSwapPoolsInfo(connection, connectionConfig.env).then((res: any) => {
        setPools(res);
      });
    } catch (e) {
      console.error('Saber ERROR while obtaining pools info', e);
    }
  }, [connection]);

  return {
    pools,
  };
};

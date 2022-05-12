import { useEffect, useRef, useReducer, useState } from 'react';
import { API_ENDPOINT } from '../constants';
import { FetchingStatus } from '../types/fetching-types';
import { LPair } from '../types/VaultTypes';
// import { getPoolPDA } from '../utils/ratio-pda';

/* 
  This custom hook allows to get the Vaults information from the API. There's also a status value that is returned, and that can take the following values: 
  - fetching: During the retrieval process, vaults and error values are defaulted. 
  - fetched: Data was obtained successfully, the vaults variable contains the results
  - error: There was an error fetching any of the information, the error can be found on the error variable.

  The data is cached, so next calls to it would use the cached version.

  Example usage: 
    const { status, error, vaults } = useFetchVaults();
*/
export const useFetchVaults = () => {
  const cache = useRef<LPair[]>([]);
  const [update, setUpdate] = useState(true);

  const initialState = {
    status: FetchingStatus.NotAsked,
    error: null,
    vaults: [],
  };

  const [state, dispatch] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...initialState, status: FetchingStatus.Loading };
      case 'FETCHED':
        return { ...initialState, status: FetchingStatus.Finish, vaults: action.payload };
      case 'FETCH_ERROR':
        return { ...initialState, status: FetchingStatus.Error, error: action.payload };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;
    if (!API_ENDPOINT || !API_ENDPOINT.trim()) return;
    const url = `${API_ENDPOINT}/lpairs`;

    // Gets the data for all the existent vaults. If a cached version is found, it gets returned.
    const fetchData = async () => {
      dispatch({ type: 'FETCHING' });
      if (cache.current && cache.current.length > 0 && update === false) {
        const data = cache.current;
        dispatch({ type: 'FETCHED', payload: data });
      } else {
        try {
          const response = await fetch(url);
          let data: LPair[] = [];

          if (response.ok) {
            data = await response.json();
            // cache.current = data;
            cache.current = [
              {
                address_id: '2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf',
                collateralization_ratio: 0,
                icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf/icon.png',
                liquidation_ratio: 0,
                lpasset: [],
                page_url: 'https://app.saber.so/pools/usdc_usdt',
                platform_id: '37102bc5-187e-47d6-9728-234de8553879',
                platform_symbol: 'SBR',
                platform_name: 'SABER',
                pool_size: 0,
                reward_mint: '',
                risk_rating: 'AAA',
                symbol: 'Saber USDT-USDC',
                vault_address_id: 'uQV9J7m2xHXmfht3GpHKNdWhhoc3XnCg4KxhCjxFY5P',
              } as any,
            ];
          } else {
            if (cancelRequest) return;
            dispatch({ type: 'FETCH_ERROR', payload: await response.json() });
          }

          if (cancelRequest) return;
          dispatch({ type: 'FETCHED', payload: data });
        } catch (error: any) {
          if (cancelRequest) return;
          dispatch({ type: 'FETCH_ERROR', payload: error.message });
        }
      }
      setUpdate(false);
    };

    fetchData();

    // We use the cancelrequest variable to avoid updating any component state if the component was cleaned up.
    return () => {
      cancelRequest = true;
    };
  }, [API_ENDPOINT, update]);

  const forceUpdate = () => {
    setUpdate(true);
  };

  return {
    ...state,
    forceUpdate: forceUpdate,
  };
};

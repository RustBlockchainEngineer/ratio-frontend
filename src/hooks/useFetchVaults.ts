import { useEffect, useRef, useReducer } from 'react';
import { API_ENDPOINT } from '../constants';
import { LPair } from '../types/VaultTypes';

/* 
  This custom hook allows to get the Vaults information from the API. There's also a status value that is returned, and that can take the following values: 
  - fetching: During the retrieval process, vaults and error values are defaulted. 
  - fetched: Data was obtained successfully, the vaults variable contains the results
  - error: There was an error fetching any of the information, the error can be found on the error variable.

  The data is cached, so next calls to it would use the cached version.

  Example usage: 
    const { status, error, vaults } = useFetchVaults();
*/
export enum VaultsFetchingStatus {
  NotAsked,
  Loading,
  Finish,
  Error,
}
export const useFetchVaults = () => {
  const cache = useRef<LPair[]>([]);

  const initialState = {
    status: VaultsFetchingStatus.NotAsked,
    error: null,
    vaults: [],
  };

  const [state, dispatch] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...initialState, status: VaultsFetchingStatus.Loading };
      case 'FETCHED':
        return { ...initialState, status: VaultsFetchingStatus.Finish, vaults: action.payload };
      case 'FETCH_ERROR':
        return { ...initialState, status: VaultsFetchingStatus.Error, error: action.payload };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;
    const url = `${API_ENDPOINT}/lpairs`;
    if (!API_ENDPOINT || !API_ENDPOINT.trim()) return;

    // Gets the data for all the existent vaults. If a cached version is found, it gets returned.
    const fetchData = async () => {
      dispatch({ type: 'FETCHING' });
      if (cache.current && cache.current.length > 0) {
        const data = cache.current;
        dispatch({ type: 'FETCHED', payload: data });
      } else {
        try {
          const response = await fetch(url);
          const data: LPair[] = await response.json();
          cache.current = data;
          if (cancelRequest) return;
          dispatch({ type: 'FETCHED', payload: data });
        } catch (error: any) {
          if (cancelRequest) return;
          dispatch({ type: 'FETCH_ERROR', payload: error.message });
        }
      }
    };

    fetchData();

    // We use the cancelrequest variable to avoid updating any component state if the component was cleaned up.
    return () => {
      cancelRequest = true;
    };
  }, [API_ENDPOINT]);

  return state;
};

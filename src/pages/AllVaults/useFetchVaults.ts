import { useEffect, useRef, useReducer } from 'react';
import { API_ENDPOINT } from '../../constants';
import { LPair, PlatformsDict, Platform } from './types';

export const useFetchVaults = () => {
  const cache = useRef<LPair[]>([]);
  const platformsCache = useRef<PlatformsDict>({});

  const initialState = {
    status: 'idle',
    error: null,
    vaults: [],
  };

  const [state, dispatch] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...initialState, status: 'fetching' };
      case 'FETCHED':
        return { ...initialState, status: 'fetched', vaults: action.payload };
      case 'FETCH_ERROR':
        return { ...initialState, status: 'error', error: action.payload };
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;
    const url = `${API_ENDPOINT}/lpairs`;
    if (!API_ENDPOINT || !API_ENDPOINT.trim()) return;

    const getPlatform = async (platform_id: string) => {
      const url = `${API_ENDPOINT}/platforms/${platform_id}`;
      let data: Platform = { name: '' };
      if (platformsCache.current[url]) {
        data = platformsCache.current[url];
      } else {
        try {
          const response = await fetch(url);
          data = await response.json();
          platformsCache.current[url] = data;
        } catch (error: any) {
          if (cancelRequest) return;
          dispatch({ type: 'FETCH_ERROR', payload: error.message });
        }
      }
      return data;
    };

    const fetchData = async () => {
      dispatch({ type: 'FETCHING' });
      if (cache.current && cache.current.length > 0) {
        const data = cache.current;
        dispatch({ type: 'FETCHED', payload: data });
      } else {
        try {
          const response = await fetch(url);
          const data: LPair[] = await response.json();
          data.forEach(async (item) => {
            item.platform = await getPlatform(item.platform_id);
          });
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

    return function cleanup() {
      cancelRequest = true;
    };
  }, [API_ENDPOINT]);

  return state;
};

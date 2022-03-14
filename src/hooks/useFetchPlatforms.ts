import { useEffect, useReducer } from 'react';
import { API_ENDPOINT } from '../constants';
import { useAuthContextProvider } from '../contexts/authAPI';
import { FetchingStatus } from '../types/fetching-types';
import { Platform } from '../types/VaultTypes';

/* 
  This custom hook allows to get the Platforms information from the API. There's also a status value that is returned, and that can take the following values: 
  - fetching: During the retrieval process, platforms and error values are defaulted. 
  - fetched: Data was obtained successfully, the platforms variable contains the results
  - error: There was an error fetching any of the information, the error can be found on the error variable.

  The data is cached, so next calls to it would use the cached version.

  Example usage: 
    const { status, error, vaults } = useFetchVaults();
*/

interface State {
  status: FetchingStatus;
  error: Maybe<string>;
  platforms: Maybe<Platform[]>;
}

export const useFetchPlatforms = () => {
  const initialState: State = {
    status: FetchingStatus.NotAsked,
    error: null,
    platforms: null,
  };
  const { accessToken } = useAuthContextProvider();

  const [state, dispatch] = useReducer((state: State, action: any) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...initialState, status: FetchingStatus.Loading } as State;
      case 'FETCHED':
        return { ...initialState, status: FetchingStatus.Finish, platforms: action.payload } as State;
      case 'FETCH_ERROR':
        return { ...initialState, status: FetchingStatus.Error, error: action.payload } as State;
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    let cancelRequest = false;
    if (!API_ENDPOINT || !API_ENDPOINT.trim() || !accessToken) return;

    // Gets the data for all the existent platforms. If a cached version is found, it gets returned.
    const fetchData = async () => {
      dispatch({ type: 'FETCHING' });
      try {
        const response = await fetch(`${API_ENDPOINT}/platforms`, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': JSON.stringify(accessToken),
          },
          method: 'GET',
        });
        let data: Platform[] = [];

        if (response.ok) {
          data = await response.json();
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
    };

    fetchData();

    // We use the cancelrequest variable to avoid updating any component state if the component was cleaned up.
    return () => {
      cancelRequest = true;
    };
  }, [API_ENDPOINT, accessToken]);

  return {
    ...state,
  };
};

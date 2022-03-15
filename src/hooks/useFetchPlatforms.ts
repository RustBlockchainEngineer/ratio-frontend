import { Platform } from '../types/VaultTypes';
import { useFetchData } from './useFetchData';

/* 
  This custom hook allows to get the Platforms information from the API. There's also a status value that is returned, and that can take the following values: 
  - fetching: During the retrieval process, platforms and error values are defaulted. 
  - fetched: Data was obtained successfully, the platforms variable contains the results
  - error: There was an error fetching any of the information, the error can be found on the error variable.

  The data is cached, so next calls to it would use the cached version.

  Example usage: 
    const { status, error, vaults } = useFetchVaults();
*/

export const useFetchPlatforms = () => {
  const platformFetchState = useFetchData<Platform[]>('/platforms');
  return {
    ...platformFetchState,
  };
};

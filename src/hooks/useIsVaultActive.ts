import { selectors } from '../features/dashboard';
import { useSelector } from 'react-redux';

export const useIsVaultActive = (mint: string): boolean => {
  const overview = useSelector(selectors.getOverview);
  return Object.keys(overview.activeVaults).indexOf(mint) > -1;
};

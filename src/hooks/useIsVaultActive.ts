import { useUserOverview } from '../contexts/state';

export const useIsVaultActive = (mint: string): boolean => {
  const overview = useUserOverview();
  if (overview && overview.activeVaults) {
    return Object.keys(overview.activeVaults).indexOf(mint) > -1;
  }
  return false;
};

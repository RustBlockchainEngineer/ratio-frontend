import { useRFStateInfo, useUserOverview } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';
import { DECIMALS_USDR } from '../utils/constants';

export const useIsUserUSDrLimitReached = (): boolean => {
  const userOverview = useUserOverview();
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(userOverview.totalDebt, DECIMALS_USDR).toWei();
  const maxValue = new TokenAmount(globalState?.debtCeilingUser ?? 0, DECIMALS_USDR).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

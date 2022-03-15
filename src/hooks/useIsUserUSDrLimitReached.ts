import { useRFStateInfo, useUserOverview } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';

export const useIsUserUSDrLimitReached = (): boolean => {
  const userOverview = useUserOverview();
  const globalState = useRFStateInfo();

  const activeVaults = Object.values(userOverview.activeVaults);
  const debt = activeVaults.reduce((acc: number, obj: any) => {
    return (acc + obj.debt) as number;
  }, 0);

  const currentValue = new TokenAmount(debt, 6).toWei();
  const maxValue = new TokenAmount(globalState.userDebtCeiling as string, 6).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

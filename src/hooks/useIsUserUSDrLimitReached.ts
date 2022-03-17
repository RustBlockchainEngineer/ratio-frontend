import { useRFStateInfo, useUserOverview } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';
import { USER_DEBT_CEILING_DECIMALS } from '../constants';

export const useIsUserUSDrLimitReached = (): boolean => {
  const userOverview = useUserOverview();
  const globalState = useRFStateInfo();

  const activeVaults = Object.values(userOverview?.activeVaults ?? []);
  const debt = activeVaults.reduce((acc: number, obj: any) => {
    return (acc + obj.debt) as number;
  }, 0);

  const currentValue = new TokenAmount(debt, USER_DEBT_CEILING_DECIMALS).toWei();
  const maxValue = new TokenAmount(globalState?.userDebtCeiling ?? 0, USER_DEBT_CEILING_DECIMALS).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

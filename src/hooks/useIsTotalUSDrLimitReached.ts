import { useRFStateInfo } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';
import { GLOBAL_DEBT_CEILING_DECIMALS } from '../constants';

export const useIsTotalUSDrLimitReached = (): boolean => {
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(globalState?.totalDebt ?? 0, GLOBAL_DEBT_CEILING_DECIMALS).toWei();
  const maxValue = new TokenAmount(globalState?.debtCeiling ?? 0, GLOBAL_DEBT_CEILING_DECIMALS).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

import { useRFStateInfo } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';

export const useIsTotalUSDrLimitReached = (): boolean => {
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(globalState?.totalDebt ?? 0, 6).toWei();
  const maxValue = new TokenAmount(globalState?.debtCeiling ?? 0, 6).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

import { useRFStateInfo } from '../contexts/state';
import { DECIMALS_PRICE } from '../utils/constants';
import { TokenAmount } from '../utils/safe-math';

export const useIsTotalUSDrLimitReached = (): boolean => {
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(globalState?.totalDebt ?? 0, DECIMALS_PRICE).toWei();
  const maxValue = new TokenAmount(globalState?.debtCeilingGlobal ?? 0, DECIMALS_PRICE).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

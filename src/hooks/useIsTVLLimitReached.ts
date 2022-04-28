import { useRFStateInfo } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';
import { DECIMALS_PRICE } from '../utils/constants';

export const useIsTVLLimitReached = (): boolean => {
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(globalState?.tvlUsd ?? 0, DECIMALS_PRICE).toWei();
  const maxValue = new TokenAmount(globalState?.tvlCollatCeilingUsd ?? 0, DECIMALS_PRICE).toWei();
  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

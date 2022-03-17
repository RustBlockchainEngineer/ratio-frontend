import { useRFStateInfo } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';
import { TVL_DECIMAL } from '../constants/constants';

export const useIsTVLLimitReached = (): boolean => {
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(globalState?.tvl ?? 0, TVL_DECIMAL).toWei();
  const maxValue = new TokenAmount(globalState?.tvlLimit ?? 0, TVL_DECIMAL).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

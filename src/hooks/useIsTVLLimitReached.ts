import { useRFStateInfo } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';
import { USDR_MINT_DECIMALS } from '../utils/ratio-lending';

export const useIsTVLLimitReached = (): boolean => {
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(globalState?.tvlUsd ?? 0, USDR_MINT_DECIMALS).toWei();
  const maxValue = new TokenAmount(globalState?.tvlCollatCeilingUsd ?? 0, USDR_MINT_DECIMALS).toWei();
  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

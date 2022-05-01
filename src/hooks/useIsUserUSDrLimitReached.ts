import { useRFStateInfo, useUserOverview } from '../contexts/state';
import { TokenAmount } from '../utils/safe-math';
import { USDR_MINT_DECIMALS } from '../utils/ratio-lending';

export const useIsUserUSDrLimitReached = (): boolean => {
  const userOverview = useUserOverview();
  const globalState = useRFStateInfo();
  if (userOverview && globalState) {
    const currentValue = new TokenAmount(userOverview.totalDebt, USDR_MINT_DECIMALS).toWei();
    const maxValue = new TokenAmount(globalState?.debtCeilingUser ?? 0, USDR_MINT_DECIMALS).toWei();

    // CurrentValue and MaxValue are BigNumbers
    return currentValue.gte(maxValue);
  }
  return false;
};

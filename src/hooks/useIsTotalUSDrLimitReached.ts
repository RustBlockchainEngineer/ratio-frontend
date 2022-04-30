import { useRFStateInfo } from '../contexts/state';
import { USDR_MINT_DECIMALS } from '../utils/ratio-lending';
import { TokenAmount } from '../utils/safe-math';

export const useIsTotalUSDrLimitReached = (): boolean => {
  const globalState = useRFStateInfo();

  const currentValue = new TokenAmount(globalState?.totalDebt ?? 0, USDR_MINT_DECIMALS).toWei();
  const maxValue = new TokenAmount(globalState?.debtCeilingGlobal ?? 0, USDR_MINT_DECIMALS).toWei();

  // CurrentValue and MaxValue are BigNumbers
  return currentValue.gte(maxValue);
};

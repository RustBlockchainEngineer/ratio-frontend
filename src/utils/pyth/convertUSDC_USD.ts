/**
 * @param usdcValue : Price from jupiter obtained from jupiter hook.
 * @param usdValue : USDC/USD Value from pyth.
 * @returns usdcValue converted to usd
 * */
export function convertUSDCToUSD(usdcValue: number, usdValue: number): number {
  return usdcValue / usdValue;
}

export function getUSDrAmount(riskLevel: number, amount: number) {
  let maxUSDr = 0;
  if (riskLevel < 8) {
    maxUSDr = amount * 95.238095238;
  } else if (riskLevel < 12) {
    maxUSDr = amount * 69;
  } else if (riskLevel < 25) {
    maxUSDr = amount * 50;
  } else {
    maxUSDr = amount * 40;
  }
  return maxUSDr / 100;
}

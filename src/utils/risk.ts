export function getUSDrAmount(risk: number, amount: number, riskLevel = -1) {
  let maxUSDr = 0;
  if (risk < 8 || riskLevel === 0) {
    maxUSDr = amount * 95.238095238;
  } else if (risk < 12 || riskLevel === 1) {
    maxUSDr = amount * 69;
  } else if (risk < 25 || riskLevel === 2) {
    maxUSDr = amount * 50;
  } else {
    maxUSDr = amount * 40;
  }
  return maxUSDr / 100;
}

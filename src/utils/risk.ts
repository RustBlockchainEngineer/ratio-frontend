export function getUSDrAmount(risk: number, amount: number) {
  let maxUSDr = 0;
  if (risk < 8) {
    maxUSDr = amount * 95.238095238;
  } else if (risk < 12) {
    maxUSDr = amount * 69;
  } else if (risk < 25) {
    maxUSDr = amount * 50;
  } else {
    maxUSDr = amount * 40;
  }
  return maxUSDr / 100;
}

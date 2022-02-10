enum RiskRating {
  AAA = 101,
  AA = 102.25,
  A = 103.5,
  BBB = 105.25,
  BB = 107.5,
  B = 109.7,
  CCC = 111,
  CC = 112.25,
  C = 113.5,
  D = 116,
}

export function getUSDrAmount(risk: number, amount: number, riskLevel = 'AAA') {
  const riskRating = RiskRating[riskLevel as unknown as RiskRating];
  return amount / (Number(riskRating) / 100);
}

export function getLPAmount(risk: number, amount: number, riskLevel = 'AAA') {
  const riskRating = RiskRating[riskLevel as unknown as RiskRating];
  return amount * (Number(riskRating) / 100);
}

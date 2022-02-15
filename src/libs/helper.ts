export enum ERiskLevel {
  EXTREME = 'DDD',
  HIGH = 'DD',
  MEDIUM = 'AA',
  LOW = 'A',
  VERY_LOW = 'AAA',
}

export const CRiskLevel: any = {
  AAA: 100,
  AA: 90,
  A: 80,
  BBB: 70,
  BB: 60,
  B: 50,
  CCC: 40,
  CC: 30,
  C: 20,
  D: 10,
};

export const getRiskLevel = (c: number) => {
  if (c <= 130) return ERiskLevel.LOW;
  else if (c > 130 && c <= 145) return ERiskLevel.MEDIUM;
  else if (c > 145 && c <= 200) return ERiskLevel.HIGH;
  else if (c > 200 && c <= 250) return ERiskLevel.EXTREME;
  return ERiskLevel.VERY_LOW;
};

export const getRiskLevelNumber = (c: any) => {
  return CRiskLevel[c];
};

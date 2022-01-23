export enum ERiskLevel {
  EXTREME = 'DDD',
  HIGH = 'DD',
  MEDIUM = 'AA',
  LOW = 'AAA',
  VERY_LOW = 'A',
}

export const getRiskLevel = (c: number) => {
  if (c <= 130) return ERiskLevel.LOW;
  else if (c > 130 && c <= 145) return ERiskLevel.MEDIUM;
  else if (c > 145 && c <= 200) return ERiskLevel.HIGH;
  else if (c > 200 && c <= 250) return ERiskLevel.EXTREME;
  return ERiskLevel.VERY_LOW;
};

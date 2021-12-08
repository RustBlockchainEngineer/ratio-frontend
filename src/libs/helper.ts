export const getRiskLevel = (c: number) => {
  if (c <= 130) return 'LOW';
  else if (c > 130 && c <= 145) return 'MEDIUM';
  else if (c > 145 && c <= 200) return 'HIGH';
  else if (c > 200 && c <= 250) return 'EXTREME';
  return 'NORMAL';
};

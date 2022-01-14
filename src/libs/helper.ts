export const getRiskLevel = (c: number) => {
  if (c <= 130) return 'AAA';
  else if (c > 130 && c <= 145) return 'AA';
  else if (c > 145 && c <= 200) return 'DD';
  else if (c > 200 && c <= 250) return 'DDD';
  return 'A';
};

import { ERiskLevel } from '../types/VaultTypes';
import { getTokenBySymbol } from './tokens';

import usdrIcon from '../assets/images/USDr.png';

export const getCoinPicSymbol = (symbol: string) => {
  if (symbol === 'USDR') {
    return usdrIcon;
  } else {
    return `https://sdk.raydium.io/icons/${getTokenBySymbol(symbol)?.mintAddress}.png`;
  }
};

export const getRiskLevel = (c: number) => {
  if (c <= 130) return ERiskLevel.LOW;
  else if (c > 130 && c <= 145) return ERiskLevel.MEDIUM;
  else if (c > 145 && c <= 200) return ERiskLevel.HIGH;
  else if (c > 200 && c <= 250) return ERiskLevel.EXTREME;
  return ERiskLevel.VERY_LOW;
};

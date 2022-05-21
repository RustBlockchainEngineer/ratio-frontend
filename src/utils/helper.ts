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

export function chunks(array: any, size: any) {
  return Array.apply(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
    array.slice(index * size, (index + 1) * size)
  );
}

export const getRiskLevel = (c: number) => {
  if (c <= 130) return ERiskLevel.LOW;
  else if (c > 130 && c <= 145) return ERiskLevel.MEDIUM;
  else if (c > 145 && c <= 200) return ERiskLevel.HIGH;
  else if (c > 200 && c <= 250) return ERiskLevel.EXTREME;
  return ERiskLevel.VERY_LOW;
};

export const getSaberLpLink = (value: string) => {
  switch (value) {
    case 'USDH-USDC':
      return 'https://app.saber.so/pools/usdh/deposit';
      break;
    case 'UXD-USDC':
      return 'https://app.saber.so/pools/uxd/deposit';
      break;
    case 'USDT-USDC':
      return 'https://app.saber.so/pools/usdc_usdt/deposit';
      break;

    default:
      break;
  }
};

// import cope from '../assets/images/cope.svg';
// import eth from '../assets/images/eth.svg';
// import media from '../assets/images/media.svg';
// import ray from '../assets/images/ray.png';
// import sol from '../assets/images/sol.png';
// import srm from '../assets/images/srm.png';
// import step from '../assets/images/step.png';
// import usdc from '../assets/images/usdc.png';

import { NATIVE_SOL, TOKENS } from './tokens';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getTokenBySymbol } from './tokens';

import usdrIcon from '../assets/images/USDr.png';

const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
// const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const CLIENT_EMAIL = process.env.REACT_APP_GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.REACT_APP_GOOGLE_SERVICE_PRIVATE_KEY || '';

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

// export const getIcon = (name: any) => {
//   let icon;
//   switch (name) {
//     case 'RAY':
//       icon = ray;
//       break;
//     // case 'COPE':
//     //   icon = cope;
//     //   break;
//     case 'ETH':
//       icon = eth;
//       break;
//     case 'MEDIA':
//       icon = media;
//       break;
//     case 'SOL':
//       icon = sol;
//       break;
//     case 'SRM':
//       icon = srm;
//       break;
//     case 'STEP':
//       icon = step;
//       break;
//     case 'USDC':
//       icon = usdc;
//       break;
//     default:
//       icon = ray;
//       break;
//   }
//   return icon;
// };

export const getCoinPicUrl = (mintAddress: string | undefined) => {
  let token;
  let coinPicUrl;
  if (mintAddress === NATIVE_SOL.mintAddress) {
    token = Object.values(TOKENS).find((item) => item.mintAddress === mintAddress);
  } else {
    token = Object.values(TOKENS).find((item) => item.mintAddress === mintAddress);
  }
  if (token) {
    // coinName = token.symbol.toLowerCase();
    // coinPicUrl = `https://sdk.raydium.io/icons/${mintAddress}.png`;
    coinPicUrl = token.picUrl;
  } else {
    coinPicUrl = `https://sdk.raydium.io/icons/${mintAddress}.png`;
  }
  return coinPicUrl;
};

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

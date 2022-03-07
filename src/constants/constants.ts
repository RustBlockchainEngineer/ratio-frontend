import raydiumIcon from '../assets/images/raydium.svg';
import orcaIcon from '../assets/images/orca.svg';
import mercurialIcon from '../assets/images/mercurial.svg';
import saberIcon from '../assets/images/saber.svg';
// import { SABER_TOKEN_NEW } from '../utils/saber/constants';

export const LP_PAIR_MINT_KEYS: any = {
  'USDC-USDR': '7M2dxU1tavGpKX47baKCsspBjZ5Rcthcun8DDouSU49x',
  'ETH-SOL': '8Tddz1epzDM5nvEaYc5uPtmgu3DCRabRxsnfXu6yUneD',
  'ATLAS-RAY': '4sGmJRR53TLUo6S1ovFChdEuEssjymPNuEaaDQacuKws',
  'SAMO-RAY': '4sGmJRR53TLUo6S1ovFChdEuEssjymPNuEaaDQacuKws',
};

export const APR: any = {
  'USDC-USDR': 30,
  'ETH-SOL': 25,
  'ATLAS-RAY': 112,
  'SAMO-RAY': 115,
};

export const TVL: any = {
  'USDC-USDR': 30000000,
  'ETH-SOL': 77000000,
  'ATLAS-RAY': 60000000,
  'SAMO-RAY': 9000000,
};
export const PRICE_DECIMAL = 8;
export const GLOBAL_DEBT_CEILING_DECIMALS = 6;
export const TVL_DECIMAL = 9;
export const SBR_PRICE = 0.03108;
export const PLATFORM: any = {
  'USDC-USDR': {
    icon: raydiumIcon,
    name: 'RAYDIUM',
    link: 'https://raydium.io/pools/',
  },
  'ETH-SOL': {
    icon: orcaIcon,
    name: 'ORCA',
    link: 'https://www.orca.so/pools',
  },
  'ATLAS-RAY': {
    icon: mercurialIcon,
    name: 'MERCURIAL',
    link: 'https://mercurial.finance/',
  },
  'SAMO-RAY': {
    icon: saberIcon,
    name: 'SABER',
    link: 'https://app.saber.so/#/pools/currencies/sol',
  },
};

export const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const REFRESH_TIMER = 30_000;

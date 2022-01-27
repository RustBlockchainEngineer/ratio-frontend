import raydiumIcon from '../assets/images/raydium.svg';
import orcaIcon from '../assets/images/orca.svg';
import mercurialIcon from '../assets/images/mercurial.svg';
import saberIcon from '../assets/images/saber.svg';

export const MINTADDRESS: any = {
  USDR: '6EJAff7wySn7TMeGLH8Nk7XCZ9uYdkrYiiM5qA4sKR8i',
  'USDC-USDR': '7M2dxU1tavGpKX47baKCsspBjZ5Rcthcun8DDouSU49x',
  'ETH-SOL': '8Tddz1epzDM5nvEaYc5uPtmgu3DCRabRxsnfXu6yUneD',
  'ATLAS-RAY': '4sGmJRR53TLUo6S1ovFChdEuEssjymPNuEaaDQacuKws',
  'SAMO-RAY': 'AZFu6w1oj7t9QSgcBhpHdVmSp39QLuk6dMcqkqJ1cHXP',
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

/* eslint-disable no-bitwise */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-nested-ternary */
import { useCallback, useState } from 'react';

import { Connection, PublicKey } from '@solana/web3.js';

import * as serumCmn from '@project-serum/common';
import * as anchor from '@project-serum/anchor';

//type KnownTokenMap = Map<string, TokenInfo>;

// const formatPriceNumber = new Intl.NumberFormat('en-US', {
//   style: 'decimal',
//   minimumFractionDigits: 2,
//   maximumFractionDigits: 8,
// });
// function sleep(ms: number) {
//   return new Promise((r) => setTimeout(r, ms));
// }

export function useLocalStorageState(key: string, defaultState?: string) {
  const [state, setState] = useState(() => {
    // NOTE: Not sure if this is ok
    const storedState = localStorage.getItem(key);
    if (storedState) {
      return JSON.parse(storedState);
    }
    return defaultState;
  });

  const setLocalStorageState = useCallback(
    (newState) => {
      const changed = state !== newState;
      if (!changed) {
        return;
      }
      setState(newState);
      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newState));
      }
    },
    [state, key]
  );

  return [state, setLocalStorageState];
}

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// function getTokenName(map: KnownTokenMap, mint?: string | PublicKey, shorten = true): string {
//   const mintAddress = typeof mint === 'string' ? mint : mint?.toBase58();

//   if (!mintAddress) {
//     return 'N/A';
//   }

//   const knownSymbol = map.get(mintAddress)?.symbol;
//   if (knownSymbol) {
//     return knownSymbol;
//   }

//   return shorten ? `${mintAddress.substring(0, 5)}...` : mintAddress;
// }

// function getTokenByName(tokenMap: KnownTokenMap, name: string) {
//   let token: TokenInfo | null = null;
//   for (const val of tokenMap.values()) {
//     if (val.symbol === name) {
//       token = val;
//       break;
//     }
//   }
//   return token;
// }

// function getTokenIcon(map: KnownTokenMap, mintAddress?: string | PublicKey): string | undefined {
//   const address = typeof mintAddress === 'string' ? mintAddress : mintAddress?.toBase58();
//   if (!address) {
//     return;
//   }

//   return map.get(address)?.logoURI;
// }

// function isKnownMint(map: KnownTokenMap, mintAddress: string) {
//   return !!map.get(mintAddress);
// }

//const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

// function chunks<T>(array: T[], size: number): T[][] {
//   return Array.apply(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
//     array.slice(index * size, (index + 1) * size)
//   );
// }

// function toLamports(account?: TokenAccount | number, mint?: MintInfo): number {
//   if (!account) {
//     return 0;
//   }

//   const amount = typeof account === 'number' ? account : account.info.amount?.toNumber();

//   const precision = Math.pow(10, mint?.decimals || 0);
//   return Math.floor(amount * precision);
// }

// function wadToLamports(amount?: BN): BN {
//   return amount?.div(WAD) || ZERO;
// }

// function fromLamports(account?: TokenAccount | number | BN, mint?: MintInfo, rate = 1.0): number {
//   if (!account) {
//     return 0;
//   }

//   const amount = Math.floor(
//     typeof account === 'number' ? account : BN.isBN(account) ? account.toNumber() : account.info.amount.toNumber()
//   );

//   const precision = Math.pow(10, mint?.decimals || 0);
//   return (amount / precision) * rate;
// }

// const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

// const abbreviateNumber = (number: number, precision: number) => {
//   const tier = (Math.log10(number) / 3) | 0;
//   let scaled = number;
//   const suffix = SI_SYMBOL[tier];
//   if (tier !== 0) {
//     const scale = Math.pow(10, tier * 3);
//     scaled = number / scale;
//   }

//   return scaled.toFixed(precision) + suffix;
// };

// const formatAmount = (val: number, precision = 6, abbr = true) =>
//   abbr ? abbreviateNumber(val, precision) : val.toFixed(precision);

// function formatTokenAmount(
//   account?: TokenAccount,
//   mint?: MintInfo,
//   rate = 1.0,
//   prefix = '',
//   suffix = '',
//   precision = 6,
//   abbr = false
// ): string {
//   if (!account) {
//     return '';
//   }

//   return `${[prefix]}${formatAmount(fromLamports(account, mint, rate), precision, abbr)}${suffix}`;
// }

export const formatUSD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

// const numberFormatter = new Intl.NumberFormat('en-US', {
//   style: 'decimal',
//   minimumFractionDigits: 2,
//   maximumFractionDigits: 2,
// });

// const isSmallNumber = (val: number) => {
//   return val < 0.001 && val > 0;
// };

// const formatNumber = {
//   format: (val?: number, useSmall?: boolean) => {
//     if (!val) {
//       return '--';
//     }
//     if (useSmall && isSmallNumber(val)) {
//       return 0.001;
//     }

//     return numberFormatter.format(val);
//   },
// };

// const feeFormatter = new Intl.NumberFormat('en-US', {
//   style: 'decimal',
//   minimumFractionDigits: 2,
//   maximumFractionDigits: 9,
// });

// const formatPct = new Intl.NumberFormat('en-US', {
//   style: 'percent',
//   minimumFractionDigits: 2,
//   maximumFractionDigits: 2,
// });

// function convert(account?: TokenAccount | number, mint?: MintInfo, rate = 1.0): number {
//   if (!account) {
//     return 0;
//   }

//   const amount = typeof account === 'number' ? account : account.info.amount?.toNumber();

//   const precision = Math.pow(10, mint?.decimals || 0);
//   const result = (amount / precision) * rate;

//   return result;
// }

export function nFormatter(num: number, digits: number) {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
}

export const calculateCollateralPrice = (
  lpSupply: number,
  tokenAmountA: number,
  priceA: number,
  tokenAmountB: number,
  priceB: number
) => {
  const valueA = tokenAmountA * priceA;
  const valueB = tokenAmountB * priceB;
  return {
    fairPrice: ((Math.sqrt(valueA) * Math.sqrt(valueB)) / lpSupply) * 2,
    virtualPrice: (valueA + valueB) / lpSupply,
  };
};

export const getMint = async (connection: Connection, key: any) => {
  try {
    const id = typeof key === 'string' ? key : key?.toBase58();
    const provider = new anchor.Provider(connection, undefined as any, anchor.Provider.defaultOptions());
    const info = serumCmn.getMintInfo(provider, new PublicKey(id));
    return info;
  } catch {
    return null;
  }
};

export const shortenizeAddress = (address: PublicKey | string) => {
  const LEN = 5;
  const str_addr = address.toString();
  return str_addr.slice(0, LEN) + '....' + str_addr.slice(-LEN);
};

/**
 * Get a random number between a min and a max
 * @param {number} min
 * @param {number} max
 * @returns {any}
 */
// const randomInteger = (min: number, max: number) => {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// };

export const isWalletApproveError = (e: any) => {
  return e && (e.code === 4001 || e.code === -32603);
};

export const getTokenIcon = (tokenName) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const imgURL = require(`../assets/images/tokens/${tokenName}.png`).default;
  return imgURL;
};
export const getDateTimeStr = (num: number) => {
  if (num === 0) {
    return '';
  }
  const date = new Date(num * 1000);
  return (
    date.getHours() +
    ':' +
    date.getMinutes() +
    ':' +
    date.getSeconds() +
    ' ' +
    date.getDate() +
    '/' +
    (date.getMonth() + 1) +
    '/' +
    date.getFullYear()
  );
};

export const getDateStr = (num: number) => {
  if (num === 0) {
    return '';
  }
  const date = new Date(num * 1000);
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
};

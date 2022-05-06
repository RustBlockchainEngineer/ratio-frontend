import { cloneDeep } from 'lodash-es';

import { TokenAmount } from './safe-math';

export interface TokenInfo {
  symbol: string;
  name: string;

  mintAddress: string;
  decimals: number;
  totalSupply?: TokenAmount;

  referrer?: string;

  details?: string;
  docs?: any;
  socials?: any;

  tokenAccountAddress?: string;
  balance?: TokenAmount;
  tags: string[];
}

/**
 * Get token use symbol

 * @param {string} symbol

 * @returns {TokenInfo | null} tokenInfo
 */
export function getTokenBySymbol(symbol: string): TokenInfo | null {
  if (symbol === 'SOL') {
    return cloneDeep(NATIVE_SOL);
  }

  let token = cloneDeep(TOKENS[symbol]);

  if (!token) {
    token = null;
  }

  return token;
}

/**
 * Get token use mint addresses

 * @param {string} mintAddress

 * @returns {TokenInfo | null} tokenInfo
 */
export function getTokenByMintAddress(mintAddress: string): TokenInfo | null {
  if (mintAddress === NATIVE_SOL.mintAddress) {
    return cloneDeep(NATIVE_SOL);
  }
  const token = Object.values(TOKENS).find((item) => item.mintAddress === mintAddress);
  return token ? cloneDeep(token) : null;
}
export interface Tokens {
  [key: string]: any;
  [index: number]: any;
}

export const TOKENS_TAGS: { [key: string]: { mustShow: boolean; show: boolean; outName: string } } = {
  raydium: { mustShow: true, show: true, outName: 'Raydium Default List' },
  userAdd: { mustShow: true, show: true, outName: 'User Added Tokens' },
  solana: { mustShow: false, show: false, outName: 'Solana Token List' },
  unofficial: { mustShow: false, show: false, outName: 'Permissionless Pool Tokens' },
};

export const NATIVE_SOL: TokenInfo = {
  symbol: 'SOL',
  name: 'Native Solana',
  mintAddress: 'So11111111111111111111111111111111111111112',
  decimals: 9,
  tags: [],
};

export const TOKENS: Tokens = {
  USDT: {
    symbol: 'USDT',
    name: 'USDT',
    mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    referrer: '8DwwDNagph8SdwMUdcXS5L9YAyutTyDJmK6cTKrmNFk3',
    tags: [],
  },
  WUSDT: {
    symbol: 'WUSDT',
    name: 'Wrapped USDT',
    mintAddress: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4',
    decimals: 6,
    referrer: 'CA98hYunCLKgBuD6N8MJSgq1GbW9CXdksLf5mw736tS3',
    tags: [],
  },
  USDC: {
    symbol: 'USDC',
    name: 'USDC',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    referrer: '92vdtNjEg6Zth3UU1MgPgTVFjSEzTHx66aCdqWdcRkrg',
    tags: [],
  },
  WUSDC: {
    symbol: 'WUSDC',
    name: 'Wrapped USDC',
    mintAddress: 'BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW',
    decimals: 6,
    tags: [],
  },
};

// function addTokensSolana() {
//   fetch('https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json')
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (myJson) {
//       addTokensSolanaFunc(myJson.tokens);
//     });
// }

// function addTokensSolanaFunc(tokens: any[]) {
//   tokens.forEach((itemToken: any) => {
//     if (itemToken.tags && (itemToken.tags.includes('nft') || itemToken.tags.includes('NFT'))) {
//       return;
//     }
//     const token = Object.values(TOKENS).find((item) => item.mintAddress === itemToken.address);
//     if (!token) {
//       // TOKENS[itemToken.symbol + itemToken.address + 'solana'] = {
//       TOKENS[itemToken.address] = {
//         symbol: itemToken.symbol,
//         name: itemToken.name,
//         mintAddress: itemToken.address,
//         decimals: itemToken.decimals,
//         picUrl: itemToken.logoURI,
//         tags: ['solana'],
//       };
//     } else {
//       if (token.symbol !== itemToken.symbol && !token.tags.includes()) {
//         token.symbol = itemToken.symbol;
//         token.name = itemToken.name;
//         token.decimals = itemToken.decimals;
//         token.tags.push('solana');
//       }
//       token.picUrl = itemToken.logoURI;
//     }
//   });
// }

// addTokensSolana();

export interface Platform {
  id?: string;
  name: string;
  site?: string;
  icon?: string;
  created_on?: number;
  updated_on?: number;
}

export interface PlatformsDict {
  [key: string]: Platform;
}
export interface AssetsDict {
  [key: string]: LPAsset[];
}

export enum RISK_RATING {
  'AAA',
  'AA',
  'A',
  'BBB',
  'BB',
  'B',
  'CCC',
  'CC',
  'C',
  'D',
}

export interface LPAsset {
  token_address_id: string;
  token_symbole: string;
  token_pool_size: number;
  token_icon: string;
}

export interface LPair {
  address_id: string;
  symbol: string;
  page_url: string;
  pool_size: number;
  platform_tvl: number;
  platform_ratio_apr: number;
  platform_id: string;
  platform_name?: string;
  platform_site?: string;
  platform_icon?: string;
  collateralization_ratio: number;
  earned_rewards?: number;
  liquidation_ratio: number;
  risk_rating: RISK_RATING;
  created_on?: number;
  updated_on: number;
  lpasset?: LPAsset[];
}

export interface LPairAPRLast {
  lpair_address_id: string;
  apr: number;
  created_on?: number;
}

export enum PoolProvider {
  'ORCA' = 'ORCA',
  'RAYDIUM' = 'RAYDIUM',
  'SABER' = 'SABER',
  'MERCURIAL' = 'MERCURIAL',
}

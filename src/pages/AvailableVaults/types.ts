export interface Platform {
  id?: string;
  name: string;
  created_on?: number;
  updated_on?: number;
}

export interface PlatformsDict {
  [key: string]: Platform;
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
  platform_id: string;
  collateralization_ratio: number;
  liquidation_ratio: number;
  risk_rating: RISK_RATING;
  created_on?: number;
  updated_on: number;
  lpasset?: LPAsset[];
  platform?: Platform;
}

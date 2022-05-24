export interface Platform {
  id?: string;
  name: string;
  site?: string;
  icon?: string;
  created_on?: number;
  updated_on?: number;
}
export type PairType = {
  id: number;
  mint: string;
  realUserRewardMint: string;
  icons: Array<string>;
  icon: any;
  icon1?: string;
  icon2?: string;
  title: string;
  platform: any;
  tvl: number;
  risk: string;
  riskLevel: number;
  apr: number;
  details: string;
  riskPercentage: number;
  item: LPair;
  activeStatus: boolean;
};

export interface TokenPairCardProps {
  data: PairType;
  onCompareVault: (data: PairType, status: boolean) => void;
}

export enum ERiskLevel {
  EXTREME = 'DDD',
  HIGH = 'DD',
  MEDIUM = 'AA',
  LOW = 'A',
  VERY_LOW = 'AAA',
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

interface LPAsset {
  token_address_id: string;
  token_symbole: string;
  token_pool_size: number;
  token_icon: string;
}

export interface LPair {
  address_id: string;
  vault_address_id: string;
  symbol: string;
  page_url: string;
  icon: string;
  pool_size: number;
  platform_id: string;
  platform_symbol?: string;
  platform_name?: PoolProvider;
  platform_site?: string;
  platform_icon?: string;
  collateralization_ratio: number;
  liquidation_ratio: number;
  risk_rating: RISK_RATING;
  created_on?: number;
  lpasset?: LPAsset[];
  pool?: any;
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

export interface Token {
  address_id: string;
  symbol: string;
  icon: string;
  created_on?: number;
  updated_on?: number;
}

export interface LPAssetCreationData {
  token_address_id: string;
  token_pool_size: number;
}

export interface LPEditionData {
  address_id: string;
  vault_address_id: Maybe<string>;
  page_url: Maybe<string>;
  icon: Maybe<string>;
  platform_id: Maybe<string>;
  platform_symbol: Maybe<string>;
  pool_size: Maybe<number>;
  symbol: Maybe<string>;
  collateralization_ratio: Maybe<number>;
  liquidation_ratio: Maybe<number>;
  risk_rating: Maybe<string>;
  lpasset: LPAssetCreationData[];

  reward_mint: string;
  token_mint_a: string;
  token_mint_b: string;
  token_reserve_a: string;
  token_reserve_b: string;
}

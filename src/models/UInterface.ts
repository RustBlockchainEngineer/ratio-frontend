import { LPair } from '../types/VaultTypes';

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

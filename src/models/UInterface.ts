import { LPair } from '../types/VaultTypes';

export type PairType = {
  id: number;
  mint: string;
  icons: Array<string>;
  icon: any;
  icon1?: string;
  icon2?: string;
  title: string;
  platform: any;
  tvl: number;
  risk: number;
  riskLevel: string;
  apr: number;
  earned_rewards: number;
  details: string;
  riskPercentage: number;
  item: LPair;
  hasReachedUserDebtLimit: boolean;
};

export interface TokenPairCardProps {
  data: PairType;
  onCompareVault: (data: PairType, status: boolean) => void;
  isGlobalDebtLimitReached: boolean;
}

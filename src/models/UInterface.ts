export type PairType = {
  id: number;
  mint: string;
  icons: Array<string>;
  icon1?: string;
  icon2?: string;
  title: string;
  tvl: string;
  risk: number;
  apr: number;
  details: string;
  riskPercentage: number;
};

export interface TokenPairCardProps {
  data: PairType;
  onCompareVault: (data: PairType, status: boolean) => void;
}

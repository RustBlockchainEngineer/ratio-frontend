export type PairType = {
  id: number;
  icons: Array<string>;
  icon1?: string;
  icon2?: string;
  title: string;
  tvl: string;
  risk: number;
  apr: number;
  details: string;
};

export interface TokenPairCardProps {
  data: PairType;
  onCompareVault: (data: PairType, status: boolean) => void;
}

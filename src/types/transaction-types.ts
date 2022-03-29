export interface WalletTXDetail {
  transaction_id: string;
  wallet_address_id: string;
  address_id: string;
  amount: number;
  transaction_type: TRANSACTION_TYPE;
  created_on: string;
  sawp_group: string;
  conversion_rate: number;
  base_address_id: string;
  status: string;
}
export enum TRANSACTION_TYPE {
  'deposit',
  'payback',
  'reward',
  'swap',
  'withdraw',
  'borrow',
  'stake',
}

export interface FormattedTX {
  date: string;
  txType: string;
  status: string;
  txSignature: string;
  txExplorerUrl: string;
}

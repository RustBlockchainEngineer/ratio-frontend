import { API_ENDPOINT } from '../constants/constants';
// import { useConnectionConfig } from '../contexts/connection';
import { FormattedTX, WalletTXDetail } from '../types/transaction-types';
// import { useFetchData } from './useFetchData';

// function makeRatioApiEndpointTxSignature(walletId: string, txSignature: string): string {
//   return `${API_ENDPOINT}/transaction/${walletId}/${txSignature}`;
// }

export function makeRatioApiEndpointTxHistory(walletId: string, addressId: string): string {
  return `${API_ENDPOINT}/transaction/${walletId}/detail/${addressId}`;
}

function makeSolanaExplorerLink(txSignature: string, cluster = 'devnet'): string {
  return `https://explorer.solana.com/tx/${txSignature}?cluster=${cluster}`;
}

function formatNumberWith2Digits(number: number): string {
  return (number < 10 ? '0' : '') + number;
}

function formatDate(timestamp = ''): string {
  const date = new Date(timestamp);
  const formatDate = `${formatNumberWith2Digits(date.getDate())}/${formatNumberWith2Digits(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
  const timeDate = `${formatNumberWith2Digits(date.getHours())}:${formatNumberWith2Digits(
    date.getMinutes()
  )}:${formatNumberWith2Digits(date.getSeconds())}`;
  return formatDate + ' ' + timeDate;
}

export function formatTxHistory(transactions: WalletTXDetail[], cluster: string): FormattedTX[] {
  const formattedTxs = transactions.map((tx: WalletTXDetail) => {
    return {
      date: formatDate(tx?.created_on),
      txType: tx?.transaction_type.toString(),
      status: tx?.status,
      txSignature: tx?.transaction_id,
      txExplorerUrl: makeSolanaExplorerLink(tx?.transaction_id, cluster),
      amount: parseFloat(tx?.amount),
      fair_price: tx?.fair_price,
      market_price: tx?.market_price,
    };
  });
  return formattedTxs;
}

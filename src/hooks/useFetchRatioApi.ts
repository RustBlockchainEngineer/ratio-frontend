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
    };
  });
  return formattedTxs;
}

// function useFetchVaultTxRatioApi(walletId = '', txSignature: string, authToken: any) {
//   const [result, setResult] = useState<any>({ data: 'DATA NOT LOADED YET' });
//   const [error, setError] = useState<any>(null);

//   useEffect(() => {
//     let cancelRequest = false;
//     async function fetchTxData() {
//       try {
//         const endpoint = makeRatioApiEndpointTxSignature(walletId, txSignature);
//         const res = await fetch(endpoint, {
//           headers: {
//             'Content-Type': 'application/json',
//             'x-access-token': JSON.stringify(authToken),
//           },
//           method: 'GET',
//         });
//         const result = await res.json();
//         if (cancelRequest) return;
//         setResult(result);
//       } catch (error) {
//         if (cancelRequest) return;
//         setError(cancelRequest);
//       }
//     }

//     fetchTxData();

//     return function cleanup() {
//       cancelRequest = true;
//     };
//   }, [authToken]);

//   return [result, error];
// }

// export function useFetchVaultTxHistoryRatioApi(walletId = '', mintAddress: string, lastTen: boolean) {
//   const {
//     data: rawTransactions,
//     status,
//     error,
//   } = useFetchData<WalletTXDetail[]>(makeRatioApiEndpointTxHistory(walletId, mintAddress), false);

//   const cluster = useConnectionConfig()?.env;
//   const [result, setResult] = useState<FormattedTX[]>([]);

//   useEffect(() => {
//     if (!rawTransactions) {
//       return;
//     }
//     const d: any = rawTransactions.sort(function (a: any, b: any) {
//       const c: any = new Date(a.created_on);
//       const d: any = new Date(b.created_on);
//       return d - c;
//     });
//     const formattedTxData = formatTxHistory(d, cluster);
//     if (lastTen) {
//       setResult(formattedTxData.slice(0, 10));
//     } else {
//       setResult(formattedTxData);
//     }
//   }, [lastTen]);

//   return {
//     result,
//     status,
//     error,
//   };
// }

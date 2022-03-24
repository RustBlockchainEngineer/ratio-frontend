import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import share from '../../../assets/images/share.svg';
import LoadingSpinner from '../../../atoms/LoadingSpinner';
import { useWallet } from '../../../contexts/wallet';
import { useFetchVaultTxHistoryRatioApi } from '../../../hooks/useFetchRatioApi';
import { FetchingStatus } from '../../../types/fetching-types';
import { FormattedTX } from '../../../types/transaction-types';

const VaultHistoryTable = ({ mintAddress }: any) => {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString();

  const { result: txHistory, status, error } = useFetchVaultTxHistoryRatioApi(wallet, mintAddress);

  return (
    <div className="vaulthistorytable">
      <h4>Vault History</h4>

      <div className="vaulthistorytable__table">
        <Table striped hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th className="w-50">Status</th>
              <th className="text-right">Tx Signature</th>
            </tr>
          </thead>
          <tbody>
            {status === FetchingStatus.Loading && (
              <tr>
                <td colSpan={4} className="text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            )}
            {status === FetchingStatus.Error &&
              toast.error('There was an error when fetching the transactions history') &&
              console.error(error)}
            {status === FetchingStatus.Finish &&
              (txHistory.length > 0 ? (
                txHistory.map((tx: FormattedTX) => {
                  return (
                    <tr>
                      <td className="w-50">{tx?.date}</td>
                      <td className="activity">{tx?.txType}</td>
                      <td className="activity">{tx?.status}</td>
                      <td className="tx_hash text-right">
                        `${tx?.txSignature?.slice(31, 35)}...`
                        <img src={share} alt="share" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">
                    <h6>Coming Soon</h6>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default VaultHistoryTable;

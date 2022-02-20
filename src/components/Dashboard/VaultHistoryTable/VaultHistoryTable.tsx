import React from 'react';
import { Table } from 'react-bootstrap';
import share from '../../../assets/images/share.svg';
import { useAuthContextProvider } from '../../../contexts/authAPI';
import { useWallet } from '../../../contexts/wallet';
import { useFetchVaultTxHistoryRatioApi } from '../../../hooks/useFetchRatioApi';

const VaultHistoryTable = ({ mintAddress }: any) => {
  const { accessToken } = useAuthContextProvider();
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString();

  const txHistory = useFetchVaultTxHistoryRatioApi(wallet, mintAddress, accessToken);

  const vaultHistory =
    txHistory[0].length > 0 ? (
      txHistory.map((tx: any) => {
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
          <h6>There is no transactions</h6>
        </td>
      </tr>
    );

  console.log();

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
          <tbody>{vaultHistory}</tbody>
        </Table>
      </div>
    </div>
  );
};

export default VaultHistoryTable;

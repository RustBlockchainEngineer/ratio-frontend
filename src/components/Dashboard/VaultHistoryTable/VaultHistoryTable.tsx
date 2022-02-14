/* eslint-disable prettier/prettier */
import React from 'react';
import { Table } from 'react-bootstrap';
import share from '../../../assets/images/share.svg';
import { useAuthContextProvider } from '../../../contexts/authAPI';
import { useWallet } from '../../../contexts/wallet';
import { useFetchVaultTxRatioApi } from '../../../hooks/useFetchRatioApi';
import { getFromRatioApi } from '../../../utils/ratioApi/index';

///transaction/:wallet_id/:signature

const VaultHistoryTable = () => {
  const { accessToken } = useAuthContextProvider();
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString();
  const txHistoryData = useFetchVaultTxRatioApi(
    wallet,
    '3XRJiw4CjkcrtDPuGsLnC4AYimS5xc7YMkTxbtMzQK5GqZ65U2YvGWNUoXaUmLoepVG3NwkiAuX7cmuEtqPrMwTb',
    accessToken);
  console.log(txHistoryData);
  return (
    <div className="vaulthistorytable">
      <h4>Vault History</h4>

      <div className="vaulthistorytable__table">
        <Table striped hover>
          <thead>
            <tr>
              <th>Date</th>
              <th className="w-50">Status</th>
              <th className="text-right">Tx Signature</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="activity">Confirmed</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
            <tr>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="activity">Pending</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
            <tr>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="activity">Rejected</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default VaultHistoryTable;

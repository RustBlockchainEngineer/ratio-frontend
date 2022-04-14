import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import share from '../../../assets/images/share.svg';
import LoadingSpinner from '../../../atoms/LoadingSpinner';
import { useWallet } from '../../../contexts/wallet';
import { useFetchVaultTxHistoryRatioApi } from '../../../hooks/useFetchRatioApi';
import { FetchingStatus } from '../../../types/fetching-types';
import { FormattedTX } from '../../../types/transaction-types';
import { selectors } from '../../../features/dashboard';

const VaultHistoryTable = ({ mintAddress }: any) => {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString();

  const [lastTen, setLastTen] = useState(true);
  const [, forceUpdate] = useState();

  const overview = useSelector(selectors.getOverview);

  useEffect(() => {
    setTimeout(forceUpdate, 2000);
  }, [overview]);

  const { result: txHistory, status, error } = useFetchVaultTxHistoryRatioApi(wallet, mintAddress, lastTen);

  const onClickReadMore = () => {
    setLastTen(!lastTen);
  };

  return (
    <div className="vaulthistorytable">
      <div className="d-flex justify-content-between">
        <h4>Vault History</h4>
        <p onClick={onClickReadMore} className="vaulthistorytable__readmore">
          {lastTen ? 'Read more' : 'React less'}
        </p>
      </div>
      <div className="vaulthistorytable__table">
        <Table striped hover>
          <thead>
            <tr>
              <th>No</th>
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
                txHistory.map((tx: FormattedTX, index: number) => {
                  return (
                    <tr>
                      <td>{index + 1}</td>
                      <td className="w-50">{tx?.date}</td>
                      <td className="activity">{tx?.txType}</td>
                      <td className="activity">{tx?.status}</td>
                      <td className="tx_hash text-right">
                        <a className="d-flex" target="_blank" rel="noreferrer" href={tx?.txExplorerUrl}>
                          {`${tx?.txSignature?.slice(0, 4)}...`}
                          <img src={share} alt="share" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">
                    <h6>There&apos;s no transaction history</h6>
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

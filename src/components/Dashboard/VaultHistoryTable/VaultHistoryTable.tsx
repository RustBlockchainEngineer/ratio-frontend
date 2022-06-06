import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { useConnectionConfig } from '../../../contexts/connection';
import share from '../../../assets/images/share.svg';
import LoadingSpinner from '../../../atoms/LoadingSpinner';
import { useWallet } from '../../../contexts/wallet';
import { formatTxHistory, makeRatioApiEndpointTxHistory } from '../../../hooks/useFetchRatioApi';
import { FormattedTX } from '../../../types/transaction-types';
import { useUserOverview } from '../../../contexts/state';

const VaultHistoryTable = ({ mintAddress }: any) => {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toString();

  const [lastTen, setLastTen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<any>();
  const cluster = useConnectionConfig()?.env;
  const overview = useUserOverview();

  useEffect(() => {
    let cancelRequest = false;
    const fetchData = async () => {
      setLoading(true);
      const headers: { [k: string]: any } = {
        'Content-Type': 'application/json',
      };
      const response = await fetch(makeRatioApiEndpointTxHistory(wallet, mintAddress), {
        headers: headers,
        method: 'GET',
      });
      if (response.ok) {
        const rawTransactions = await response.json();
        const d: any = rawTransactions.sort(function (a: any, b: any) {
          const c: any = new Date(a.created_on);
          const d: any = new Date(b.created_on);
          return d - c;
        });
        const formattedTxData = formatTxHistory(d, cluster);
        if (lastTen) {
          setHistoryData(formattedTxData.slice(0, 10));
        } else {
          setHistoryData(formattedTxData);
        }
        setHistoryData(formattedTxData);
        setLoading(false);
        if (cancelRequest) return;
        setLoading(false);
      } else {
        setLoading(false);
        if (cancelRequest) return;
        setLoading(false);
      }
    };

    // call the function
    fetchData();
    return () => {
      cancelRequest = true;
    };
  }, [overview, lastTen]);

  const onClickReadMore = () => {
    setLastTen(!lastTen);
  };

  return (
    <div className="vaulthistorytable">
      <div className="d-flex justify-content-between">
        <h4>Vault History</h4>
        <p onClick={onClickReadMore} className="vaulthistorytable__readmore">
          {lastTen ? 'Read more' : 'Read less'}
        </p>
      </div>
      <div className="vaulthistorytable__table">
        <Table striped hover>
          <thead>
            <tr>
              <th>No</th>
              <th>Date</th>
              <th>Type</th>
              <th>LP price</th>
              <th>Amount</th>
              <th className="w-50">Status</th>
              <th className="text-right">Tx Signature</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : historyData && historyData?.length > 0 ? (
              historyData?.map((tx: FormattedTX, index: number) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="w-50">{tx?.date}</td>
                    <td className="activity">{tx?.txType}</td>
                    <td className="activity">{tx?.fair_price && tx?.fair_price}</td>
                    <td className="activity">{(Math.ceil(tx?.amount * 10000) / 10000).toFixed(4)}</td>
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
                <td colSpan={7} className="text-center">
                  <h6>There&apos;s no transaction history</h6>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default VaultHistoryTable;

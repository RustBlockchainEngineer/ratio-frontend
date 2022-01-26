import React from 'react';
import { Table } from 'react-bootstrap';
import share from '../../../assets/images/share.svg';

const VaultHistoryTable = () => {
  return (
    <div className="vaulthistorytable">
      <h4>Vault History</h4>

      <div className="vaulthistorytable__table">
        <Table striped hover>
          <thead>
            <tr>
              <th className="w-50">Activity</th>
              <th>Date</th>
              <th className="text-right">TX Hash</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="activity">Opened Vault</td>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
            <tr>
              <td className="activity">Deposited xxx *LP Name* to vault</td>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
            <tr>
              <td className="activity">Minted xxx new USDr</td>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
            <tr>
              <td className="activity">Payed back xxx USDr</td>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
            <tr>
              <td className="activity">Withdrew xxx *LP Name* from vault</td>
              <td className="date">04/23/2021, 10:08am</td>
              <td className="tx_hash text-right">
                5dco…
                <img src={share} alt="share" />
              </td>
            </tr>
            <tr>
              <td className="activity">Harvested xxx *Token Name* from vault</td>
              <td className="date">04/23/2021, 10:08am</td>
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

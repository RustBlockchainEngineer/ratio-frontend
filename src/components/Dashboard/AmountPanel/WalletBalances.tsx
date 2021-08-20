import React from 'react';

import { Table } from 'react-bootstrap';
import RAY from '../../../assets/images/RAY.svg';
import SOL from '../../../assets/images/SOL.svg';
import USDr from '../../../assets/images/USDr.png';

const WalletBalances = () => {
  return (
    <div>
      <h4>Wallet Balances</h4>
      <Table striped hover>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Balance</th>
            <th className="text-right">USD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="name">
              <img src={RAY} alt="RAY" />
              <img src={SOL} alt="RAY" className="lastToken" />
              RAY-SOL-LP
            </td>
            <td>20.36</td>
            <td className="text-right">$635.12</td>
          </tr>
          <tr>
            <td>
              <img src={USDr} alt="RAY" style={{ width: 32 }} /> USDr
            </td>
            <td>52.28</td>
            <td className="text-right">$52.28</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default WalletBalances;

import React from 'react';

import { Table } from 'react-bootstrap';
import Button from '../../Button';
import RAY from '../../../assets/images/RAY.svg';
import SOL from '../../../assets/images/SOL.svg';

const TokensEarned = () => {
  return (
    <div>
      <h4>Tokens Earned</h4>
      <Table striped hover>
        <thead>
          <tr>
            <th className="w-75">Name</th>
            <th className="w-25">Amount farmed</th>
            <th className="text-right">$value of tokens</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="name">
              <img src={RAY} alt="RAY" />
              <img src={SOL} alt="RAY" className="lastToken" />
              RAY-SOL-LP
            </td>
            <td>$500</td>
            <td className="text-right">$1,200</td>
          </tr>
          <tr>
            <td className="name">
              <img src={RAY} alt="RAY" />
              <img src={SOL} alt="RAY" className="lastToken" />
              RAY-SOL-LP
            </td>
            <td>$500</td>
            <td className="text-right">$1,200</td>
          </tr>
          <tr>
            <td className="name">
              <img src={RAY} alt="RAY" />
              <img src={SOL} alt="RAY" className="lastToken" />
              RAY-SOL-LP
            </td>
            <td>$500</td>
            <td className="text-right">$1,200</td>
          </tr>
        </tbody>
      </Table>
      <div className="px-4">
        <Button className="button--fill generate btn-block">Harvest</Button>
      </div>
    </div>
  );
};

export default TokensEarned;

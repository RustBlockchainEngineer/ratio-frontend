import React from 'react'

import { Table } from 'react-bootstrap'
import RAY from '../../../assets/images/RAY.svg'
import SOL from '../../../assets/images/SOL.svg'

const TokensEarned = () => {
  return (
    <div>
      <h4>Tokens Earned</h4>
      <Table striped hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount farmed</th>
            <th className="text-right">$vale of tokens</th>
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
    </div>
  )
}

export default TokensEarned

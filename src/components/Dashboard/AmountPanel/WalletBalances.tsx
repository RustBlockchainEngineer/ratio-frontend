import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

import { Table } from 'react-bootstrap';
import USDr from '../../../assets/images/USDr.png';
import { useAccountByMint, useMint } from '../../../contexts/accounts';

import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { USDR_MINT_KEY } from '../../../utils/ratio-lending';
import { TokenAmount } from '../../../utils/safe-math';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';

const WalletBalances = ({ data }: any) => {
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
              <img src={data.icons ? data.icons[0] : null} alt="TokenA" style={{ width: 32 }} />
              <img src={data.icons ? data.icons[1] : null} alt="TokenB" style={{ width: 32 }} className="lastToken" />
              {data.tokenName === 'USDC-USDR' ? 'USDC-USDr' : data.tokenName}
            </td>
            <td>{data.collAmount.toFixed(2)}</td>
            <td className="text-right">$ {data.collAmountUSD.toFixed(2)}</td>
          </tr>
          <tr>
            <td>
              <img src={USDr} alt="RAY" style={{ width: 32 }} /> USDr
            </td>
            <td>{data.usdrAmount.toFixed(2)}</td>
            <td className="text-right">${data.usdrAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default WalletBalances;

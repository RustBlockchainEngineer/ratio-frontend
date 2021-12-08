import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

import { Table } from 'react-bootstrap';
import RAY from '../../../assets/images/RAY.svg';
import SOL from '../../../assets/images/SOL.svg';
import USDr from '../../../assets/images/USDr.png';
import { useAccountByMint, useMint } from '../../../contexts/accounts';

import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { USDR_MINT_KEY } from '../../../utils/ratio-lending';
import { TokenAmount } from '../../../utils/safe-math';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';

const WalletBalances = ({ vault_mint }: any) => {
  const collAccount = useAccountByMint(vault_mint);
  const collMint = useMint(vault_mint);
  const [collAmount, setCollAmount] = useState(0);

  const usdrAccount = useAccountByMint(USDR_MINT_KEY);
  const usdrMint = useMint(USDR_MINT_KEY);
  const [usdrAmount, setUSDrAmount] = useState(0);

  useEffect(() => {
    if (collAccount) {
      const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
      setCollAmount(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
    }
    if (usdrAccount) {
      const tokenAmount = new TokenAmount(usdrAccount.info.amount + '', usdrMint?.decimals);
      setUSDrAmount(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
    }
    return () => {
      setCollAmount(0);
      setUSDrAmount(0);
    };
  });

  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }
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
            <td>{collAmount}</td>
            <td className="text-right">$635.12</td>
          </tr>
          <tr>
            <td>
              <img src={USDr} alt="RAY" style={{ width: 32 }} /> USDr
            </td>
            <td>{usdrAmount}</td>
            <td className="text-right">$52.28</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default WalletBalances;

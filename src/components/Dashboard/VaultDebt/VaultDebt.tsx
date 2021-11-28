import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { repayUSDr, USDC_USDR_LP_MINT_KEY } from '../../../utils/ratio-lending';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';

import Button from '../../Button';

const VaultDebt = () => {
  const connection = useConnection();
  const { wallet } = useWallet();
  const [vault, setVault] = React.useState({});
  const [isCreated, setCreated] = React.useState({});
  const [userCollAccount, setUserCollAccount] = React.useState('');
  useEffect(() => {
    if (wallet?.publicKey) {
      getOneFilteredTokenAccountsByOwner(connection, wallet?.publicKey, new PublicKey(USDC_USDR_LP_MINT_KEY)).then(
        (res) => {
          setUserCollAccount(res);
        }
      );
    }
  }, [connection, wallet]);

  const repay = () => {
    if (userCollAccount !== '') {
      repayUSDr(connection, wallet, 10 * 1000000, new PublicKey(USDC_USDR_LP_MINT_KEY))
        .then(() => {})
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {});
    }
  };

  return (
    <div className="vaultdebt">
      <h4>Vault Debt</h4>
      <p>
        You Owe <strong>$7.45 USDr</strong>
      </p>
      <Button className="button--fill paybackusdr" onClick={() => repay()}>
        Pay Back USDr
      </Button>
    </div>
  );
};

export default VaultDebt;

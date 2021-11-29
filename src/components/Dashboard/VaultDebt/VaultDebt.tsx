import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { useAccountByMint, useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { repayUSDr, USDC_USDR_LP_MINT_KEY, USDR_MINT_KEY } from '../../../utils/ratio-lending';
import { TokenAmount } from '../../../utils/safe-math';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';

import Button from '../../Button';

const VaultDebt = () => {
  const connection = useConnection();
  const { wallet } = useWallet();

  const usdrAccount = useAccountByMint(USDR_MINT_KEY);
  const usdrMint = useMint(USDR_MINT_KEY);
  const [usdrAmount, setUSDrAmount] = useState(0);

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

  useEffect(() => {
    if (usdrAccount) {
      const tokenAmount = new TokenAmount(usdrAccount.info.amount + '', usdrMint?.decimals);
      setUSDrAmount(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
    }
  });

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
        You Owe <strong>$ {usdrAmount} USDr</strong>
      </p>
      <Button className="button--fill paybackusdr" onClick={() => repay()}>
        Pay Back USDr
      </Button>
    </div>
  );
};

export default VaultDebt;

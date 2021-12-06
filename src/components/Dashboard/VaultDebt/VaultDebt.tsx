import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { useAccountByMint, useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { repayUSDr } from '../../../utils/ratio-lending';
import { TokenAmount } from '../../../utils/safe-math';

import Button from '../../Button';

const VaultDebt = ({ data }: any) => {
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const usdrMint = useMint(data.usdrMint);
  const usdrAccount = useAccountByMint(data.usdrMint);
  const [usdrAmount, setUSDrAmount] = useState(0);

  useEffect(() => {
    if (usdrAccount) {
      const tokenAmount = new TokenAmount(usdrAccount.info.amount + '', usdrMint?.decimals);
      setUSDrAmount(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
    }
    return () => {
      setUSDrAmount(0);
    };
  });

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const repay = () => {
    if (usdrMint) {
      repayUSDr(connection, wallet, 10 * Math.pow(10, usdrMint?.decimals), new PublicKey(data.mint))
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

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

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const repay = () => {
    console.log('Paying back at all', data.usdrValue);
    if (usdrMint) {
      repayUSDr(connection, wallet, Number(data.usdrValue) * Math.pow(10, usdrMint?.decimals), new PublicKey(data.mint))
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
        You Owe <strong>$ {Math.ceil(Number(data.usdrValue) * 100) / 100} USDr</strong>
      </p>
      <Button className="button--fill paybackusdr" onClick={() => repay()}>
        Pay Back USDr
      </Button>
    </div>
  );
};

export default VaultDebt;

import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccountByMint, useMint } from '../../../contexts/accounts';
import { useUpdateState } from '../../../contexts/auth';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { repayUSDr } from '../../../utils/ratio-lending';
import { TokenAmount } from '../../../utils/safe-math';

import Button from '../../Button';
import PaybackModal from '../PaybackModal';

import usdrIcon from '../../../assets/images/USDr.png';

const VaultDebt = ({ data }: any) => {
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const usdrMint = useMint(data.usdrMint);

  const [didMount, setDidMount] = React.useState(false);
  const { setUpdateStateFlag } = useUpdateState();

  const paybackData = {
    mint: data.mint,
    icons: [usdrIcon],
    title: '',
    usdrValue: data.usdrValue,
    usdrMint: data.usdrMint,
  };

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const repay = () => {
    console.log('Paying back at all', data.usdrValue);
    if (!data.usdrValue) {
      return toast('Insufficient funds to payback!');
    }
    if (!usdrMint) {
      return toast('Invalid USDr Mint address to payback!');
    }
    repayUSDr(connection, wallet, Number(data.usdrValue) * Math.pow(10, usdrMint?.decimals), new PublicKey(data.mint))
      .then(() => {
        setUpdateStateFlag(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {});
  };

  return (
    <div className="vaultdebt">
      <h4>Vault Debt</h4>
      {/* <PaybackModal data={paybackData} /> */}
      {/* <Button className="button--fill paybackusdr" onClick={() => repay()}>
        Pay Back
      </Button> */}
      <p>
        You owe <strong>{Math.ceil(data.usdrValue * 100) / 100} USDr</strong>
      </p>
    </div>
  );
};

export default VaultDebt;

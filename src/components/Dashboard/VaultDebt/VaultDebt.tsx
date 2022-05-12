import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { repayUSDr, USDR_MINT_DECIMALS, USDR_MINT_KEY } from '../../../utils/ratio-lending';

import usdrIcon from '../../../assets/images/USDr.png';

const VaultDebt = ({ data }: any) => {
  const connection = useConnection();
  const { wallet } = useWallet();

  const [didMount, setDidMount] = React.useState(false);

  // eslint-disable-next-line
  const paybackData = {
    mint: data.mint,
    icons: [usdrIcon],
    title: '',
    usdrValue: data.usdrValue,
    usdrMint: USDR_MINT_KEY,
  };

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  // eslint-disable-next-line
  const repay = () => {
    console.log('Paying back at all', data.usdrValue);
    if (!data.usdrValue) {
      return toast('Insufficient funds to payback!');
    }

    repayUSDr(connection, wallet, Number(data.usdrValue) * Math.pow(10, USDR_MINT_DECIMALS), new PublicKey(data.mint))
      .then(() => {})
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {});
  };

  return (
    <div className="vaultdebt">
      <p>You owe</p>
      <strong>{Math.ceil(data.usdrValue * 100) / 100} USDr</strong>
    </div>
  );
};

export default VaultDebt;

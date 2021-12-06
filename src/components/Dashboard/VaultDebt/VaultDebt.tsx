import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { useAccountByMint, useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { getFaucetState } from '../../../utils/ratio-faucet';
import { getUsdrMintKey, repayUSDr, USDR_MINT_KEY } from '../../../utils/ratio-lending';
import { TokenAmount } from '../../../utils/safe-math';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';

import Button from '../../Button';

const VaultDebt = () => {
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [mintAddress, setMintAddress] = useState('');
  const usdrMint = useMint(mintAddress);
  const usdrAccount = useAccountByMint(mintAddress);
  const [usdcUsdrMintKey, setUsdcUsdrMintKey] = React.useState('');

  useEffect(() => {
    if (connected) {
      getUsdrMintKey(connection, wallet).then((result) => {
        setMintAddress(result);
      });
      getFaucetState(connection, wallet).then((result) => {
        if (result) {
          setUsdcUsdrMintKey(result.mintUsdcUsdrLp.toBase58());
        }
      });
    }
    return () => {
      setMintAddress('');
      setUsdcUsdrMintKey('');
    };
  });
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
      repayUSDr(connection, wallet, 10 * Math.pow(10, usdrMint?.decimals), new PublicKey(usdcUsdrMintKey))
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

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
  const { wallet } = useWallet();
  const [mintAddress, setMintAddress] = useState('');
  const usdrMint = useMint(mintAddress);
  const usdrAccount = useAccountByMint(mintAddress);

  useEffect(() => {
    getUsdrMintKey(connection, wallet).then((result) => {
      setMintAddress(result);
    });
  });
  const [usdrAmount, setUSDrAmount] = useState(0);

  const [usdcUsdrMintKey, setUsdcUsdrMintKey] = React.useState('');
  getFaucetState(connection, wallet).then((result) => {
    setUsdcUsdrMintKey(result.mintUsdcUsdrLp.toBase58());
  });

  useEffect(() => {
    if (usdrAccount) {
      const tokenAmount = new TokenAmount(usdrAccount.info.amount + '', usdrMint?.decimals);
      setUSDrAmount(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
    }
  });

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

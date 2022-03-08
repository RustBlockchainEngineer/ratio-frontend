import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { useConnection } from '../contexts/connection';
import { useWallet } from '../contexts/wallet';
import { getCurrentSuperOwner } from '../utils/ratio-lending';

export const useSuperOwner = () => {
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;
  const [superOwner, setSuperOwner] = useState<string>();

  useEffect(() => {
    let active = true;
    getCurrentSuperOwner(connection, wallet).then((result: PublicKey) => {
      if (active && result) {
        setSuperOwner(result.toBase58());
      }
    });
    return () => {
      active = false;
    };
  }, [connection, wallet]);

  return superOwner;
};

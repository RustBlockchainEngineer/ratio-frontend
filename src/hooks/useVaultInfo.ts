import { useEffect, useState } from 'react';
import { useConnection } from '../contexts/connection';
import { getTokenVaultByMint } from '../utils/ratio-lending';
import { useWallet } from '../contexts/wallet';

export const useVaultInfo = (mint: Maybe<string> | undefined) => {
  const connection = useConnection();
  const { connected } = useWallet();

  const [vault, setVault] = useState<any>(null);

  useEffect(() => {
    if (connected && mint) {
      getTokenVaultByMint(connection, mint)
        .then((res) => {
          setVault(res);
        })
        .catch((err) => {
          console.error(err);
          setVault(null);
        });
    }

    return () => {
      setVault(null);
    };
  }, [connection, connected, mint]);
  return vault;
};

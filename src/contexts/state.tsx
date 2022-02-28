import { connection } from '@project-serum/common';
import { Connection } from '@solana/web3.js';
import React, { useContext, useEffect, useState } from 'react';
import { getTokenVaultByMint, getUserState } from '../utils/ratio-lending';
import { useConnection } from './connection';
import { useVaultsContextProvider } from './vaults';
import { useWallet } from './wallet';

interface RFStateConfig {
  globalState: any;
  vaultState: any;
  userState: any;
  updateState: () => void;
}

const RFStateContext = React.createContext<RFStateConfig>({
  globalState: {},
  vaultState: {},
  userState: {},
  updateState: () => {},
});

export function RFStateProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { wallet, publicKey } = useWallet();
  const { vaults } = useVaultsContextProvider();

  const [globalState, setGlobalState] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [updateFlag, setUpdateStates] = useState<any>(false);

  const updateState = () => {
    setUpdateStates(true);
  };
  const updateVaultState = async () => {
    const vaultInfos: any = {};
    try {
      for (let i = 0; i < vaults.length; i++) {
        const vault = vaults[i];
        const mint = vault.address_id;

        const vaultInfo = await getTokenVaultByMint(connection, mint);
        vaultInfos[mint] = vaultInfo;
      }
      setVaultState(vaultInfos);
    } catch (e) {}
  };

  const updateUserState = async () => {
    const userInfos: any = {};
    try {
      for (let i = 0; i < vaults.length; i++) {
        const vault = vaults[i];
        const mint = vault.address_id;

        const userInfo = await getUserState(connection, wallet, mint);
        userInfos[mint] = userInfo;
      }
      setUserState(userInfos);
    } catch (e) {}
  };

  useEffect(() => {
    if (connection && vaults) {
      updateVaultState();
    }
    return () => {
      setVaultState({});
    };
  }, [connection, vaults]);

  useEffect(() => {
    if (connection && wallet && wallet.publicKey) {
      updateUserState();
    }

    return () => {
      setUserState({});
    };
  }, [connection, vaults, wallet]);

  return (
    <RFStateContext.Provider
      value={{
        globalState,
        vaultState,
        userState,
        updateState,
      }}
    >
      {children}
    </RFStateContext.Provider>
  );
}

export function useRFState() {
  const context = React.useContext(RFStateContext);
  if (!context) {
    throw new Error('[useRFState] Hook not used under Vaults context provider');
  }
  return context;
}

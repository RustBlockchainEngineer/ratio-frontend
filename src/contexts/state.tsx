import { connection } from '@project-serum/common';
import { Connection } from '@solana/web3.js';
import React, { useContext, useEffect, useState } from 'react';
import { getTokenVaultByMint, getUserOverview, getUserState } from '../utils/ratio-lending';
import { useConnection } from './connection';
import { useVaultsContextProvider } from './vaults';
import { useWallet } from './wallet';

interface RFStateConfig {
  globalState: any;
  vaultState: any;
  userState: any;
  overview: any;
  updateState: () => void;
}

const RFStateContext = React.createContext<RFStateConfig>({
  globalState: {},
  vaultState: {},
  userState: {},
  overview: {},
  updateState: () => {},
});

export function RFStateProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { wallet, publicKey } = useWallet();
  const { vaults } = useVaultsContextProvider();

  const [globalState, setGlobalState] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
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
    } catch (e) {
      console.log(e);
    }
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
    } catch (e) {
      console.log(e);
    }
  };

  const updateOverview = async () => {
    try {
      const mints = [];
      for (let i = 0; i < vaults.length; i++) {
        mints.push(vaults[i].address_id);
      }
      const res = await getUserOverview(connection, wallet, mints);
      setOverview(res);
    } catch (e) {
      console.log(e);
    }
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
  }, [connection, vaults, wallet, wallet?.publicKey]);

  useEffect(() => {
    if (connection && wallet && wallet.publicKey) {
      updateOverview();
    }

    return () => {
      setOverview({});
    };
  }, [connection, vaults, wallet, wallet?.publicKey]);

  return (
    <RFStateContext.Provider
      value={{
        globalState,
        vaultState,
        userState,
        overview,
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

export function useUserInfo(mint: string) {
  const context = React.useContext(RFStateContext);
  const userInfo = context.userState[mint];
  return userInfo;
}

export function useVaultInfo(mint: string) {
  const context = React.useContext(RFStateContext);
  const userInfo = context.vaultState[mint];
  return userInfo;
}
export function useUserOverview() {
  const context = React.useContext(RFStateContext);
  const overview = context.overview;
  return overview;
}

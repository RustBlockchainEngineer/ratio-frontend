import { connection, sleep } from '@project-serum/common';
import { Connection } from '@solana/web3.js';
import React, { useContext, useEffect, useState } from 'react';
import {
  calculateRewardByPlatform,
  getGlobalState,
  getTokenVaultByMint,
  getUserOverview,
  getUserState,
  USDR_MINT_KEY,
} from '../utils/ratio-lending';
import { getMint } from '../utils/utils';
import { useConnection } from './connection';
import { useVaultsContextProvider } from './vaults';
import { useWallet } from './wallet';

interface RFStateConfig {
  tokenState: any;
  globalState: any;
  vaultState: any;
  userState: any;
  overview: any;
  updateRFState: (val: boolean) => void;
  updateTokenAccount: boolean;
}

const RFStateContext = React.createContext<RFStateConfig>({
  tokenState: {},
  globalState: {},
  vaultState: {},
  userState: {},
  overview: {},
  updateRFState: () => {},
  updateTokenAccount: false,
});

export function RFStateProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { wallet, publicKey } = useWallet();
  const { vaults } = useVaultsContextProvider();

  const [globalState, setGlobalState] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [tokenState, setTokenState] = useState<any>(null);
  const [updateTokenAccount, setUpdateTokenAccount] = useState<any>(false);
  const updateRFState = (updateAll = true) => {
    setUpdateTokenAccount(true);
    sleep(3000).then(() => {
      setUpdateTokenAccount(false);
      if (updateAll) {
        updateGlobalState();
      } else {
        updateUserState();
      }
    });
  };

  const updateTokenState = async () => {
    const mintInfos: any = {};
    try {
      for (let i = 0; i < vaults.length; i++) {
        const vault = vaults[i];
        const mint = vault.address_id;

        const mintInfo = await getMint(connection, mint);
        mintInfos[mint] = mintInfo;
      }
      const mintInfo = await getMint(connection, USDR_MINT_KEY);
      mintInfos[USDR_MINT_KEY] = mintInfo;

      setTokenState(mintInfos);
    } catch (e) {
      console.log(e);
    }
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
      for (const mint of Object.keys(vaultState)) {
        const vaultInfo = vaultState[mint].tokenVault;
        const userInfo = await getUserState(connection, wallet, mint);
        if (userInfo) {
          userInfos[mint] = {
            ...userInfo,
            reward: await calculateRewardByPlatform(connection, wallet, mint, vaultInfo.platformType),
          };
        }
      }
      setUserState(userInfos);
    } catch (e) {
      console.log(e);
    }
  };

  const updateGlobalState = async () => {
    try {
      const res = await getGlobalState(connection, wallet);
      if (res) {
        setGlobalState(res.globalState);
      }
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
    if (connection) {
      updateTokenState();
    }
    return () => {
      setTokenState({});
    };
  }, [connection, vaults]);

  useEffect(() => {
    if (connection) {
      updateGlobalState();
    }
    return () => {
      setGlobalState({});
    };
  }, [connection]);

  useEffect(() => {
    if (connection && vaults) {
      updateVaultState();
    }
    return () => {
      setVaultState({});
    };
  }, [connection, vaults, globalState]);

  useEffect(() => {
    if (connection && wallet && wallet.publicKey) {
      updateUserState();
    }

    return () => {
      setUserState({});
    };
  }, [connection, vaultState, wallet, wallet?.publicKey]);

  useEffect(() => {
    if (connection && wallet && wallet.publicKey) {
      updateOverview();
    }

    return () => {
      setOverview({});
    };
  }, [connection, vaults, userState]);

  return (
    <RFStateContext.Provider
      value={{
        tokenState,
        globalState,
        vaultState,
        userState,
        overview,
        updateRFState,
        updateTokenAccount,
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

export function useRFStateInfo() {
  const context = React.useContext(RFStateContext);
  return context.globalState;
}

export function useUserInfo(mint: string) {
  const context = React.useContext(RFStateContext);
  const userInfo = context.userState[mint];
  return userInfo;
}

export function useVaultInfo(mint: string) {
  const context = React.useContext(RFStateContext);
  const userInfo = context.vaultState[mint];
  return userInfo.tokenVault;
}

export function useUserOverview() {
  const context = React.useContext(RFStateContext);
  const overview = context.overview;
  return overview;
}

export function useVaultMintInfo(mint: string) {
  const context = React.useContext(RFStateContext);
  const token = context.tokenState[mint];
  return token;
}

export function useUSDrMintInfo() {
  const context = React.useContext(RFStateContext);
  const usdrMint = context.tokenState[USDR_MINT_KEY];
  return usdrMint;
}

export function useUpdateRFStates() {
  const context = React.useContext(RFStateContext);
  return context.updateRFState;
}

export function useUpdateTokenAccounts() {
  const context = React.useContext(RFStateContext);
  return context.updateTokenAccount;
}

import { connection, sleep } from '@project-serum/common';
import { Connection } from '@solana/web3.js';
import React, { useContext, useEffect, useState } from 'react';
import {
  calculateRewardByPlatform,
  getGlobalState,
  getTokenVaultByMint,
  getUserState,
  USDR_MINT_KEY,
} from '../utils/ratio-lending';
import { getMint } from '../utils/utils';
import { useUpdateWallet } from './auth';
import { useConnection } from './connection';
import { useVaultsContextProvider } from './vaults';
import { useWallet } from './wallet';

interface RFStateConfig {
  tokenState: any;
  globalState: any;
  vaultState: any;
  userState: any;
  overview: any;
  updateRFState: (action: UpdateStateType, mint: string) => void;
}

const RFStateContext = React.createContext<RFStateConfig>({
  tokenState: {},
  globalState: {},
  vaultState: {},
  userState: {},
  overview: {},
  updateRFState: () => {},
});

export declare type UpdateStateType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const UPDATE_GLOBAL_STATE: UpdateStateType = 0;
export const UPDATE_VAULT_STATE: UpdateStateType = 1;
export const UPDATE_USER_STATE: UpdateStateType = 2;
export const UPDATE_REWARD_STATE: UpdateStateType = 3;

export function RFStateProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { wallet, publicKey } = useWallet();
  const { vaults } = useVaultsContextProvider();

  const [globalState, setGlobalState] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const [userState, setUserState] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [tokenState, setTokenState] = useState<any>(null);
  const { updateWalletFlag, setUpdateWalletFlag } = useUpdateWallet();
  const updateRFState = async (action: UpdateStateType, mint = '') => {
    await sleep(3000);
    setUpdateWalletFlag(!updateWalletFlag);

    if (action === UPDATE_GLOBAL_STATE) {
      updateGlobalState();
    } else if (action === UPDATE_VAULT_STATE) {
      updateVaultStateByMint(mint);
    } else if (action === UPDATE_USER_STATE) {
      updateUserStateByMint(mint);
    } else if (action === UPDATE_REWARD_STATE) {
      updateUserRewardByMint(mint);
    }
  };

  const updateMintState = async () => {
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

  const updateVaultStateByMint = async (mint: string) => {
    const newState = {
      ...vaultState,
    };

    const vaultInfo = await getTokenVaultByMint(connection, mint);
    newState[mint] = vaultInfo;

    setVaultState(newState);
  };

  const updateUserState = async () => {
    const userInfos: any = {};
    if (!vaultState) {
      return;
    }
    try {
      for (const mint of Object.keys(vaultState)) {
        const vaultInfo = vaultState[mint];
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

  const updateUserStateByMint = async (mint: string) => {
    const vaultInfo = vaultState[mint];
    const userInfo = await getUserState(connection, wallet, mint);

    const newStates = {
      ...userState,
    };

    if (userInfo) {
      const reward = await calculateRewardByPlatform(connection, wallet, mint, vaultInfo.platformType);
      newStates[mint] = {
        ...userInfo,
        reward,
      };
    }

    setUserState(newStates);
  };

  const updateUserRewardByMint = async (mint: string) => {
    const vaultInfo = vaultState[mint];
    const userInfo = userState[mint];

    const newStates = {
      ...userState,
    };

    if (userInfo) {
      const reward = await calculateRewardByPlatform(connection, wallet, mint, vaultInfo.platformType);
      newStates[mint] = {
        ...userInfo,
        reward,
      };
    }

    setUserState(newStates);
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
    if (!userState) return;
    try {
      const activeVaults: any = {};
      let vaultCount = 0;
      let totalDebt = 0;
      for (const mint of Object.keys(userState)) {
        const state = userState[mint];
        if (state && state.lockedCollBalance.toString() !== '0') {
          activeVaults[mint] = {
            mint,
            lockedAmount: Number(state.lockedCollBalance.toString()),
            debt: Number(state.debt.toString()),
          };
          vaultCount++;
          totalDebt += Number(state.debt.toString());
        }
      }

      setOverview({
        activeVaults,
        totalDebt,
        vaultCount,
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (connection) {
      updateMintState();
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

  return context.userState[mint];
}

export function useVaultInfo(mint: string) {
  const context = React.useContext(RFStateContext);

  return context.vaultState[mint];
}

export function useUserOverview() {
  const context = React.useContext(RFStateContext);

  return context.overview;
}

export function useVaultMintInfo(mint: string) {
  const context = React.useContext(RFStateContext);

  return context.tokenState[mint];
}

export function useUSDrMintInfo() {
  const context = React.useContext(RFStateContext);

  return context.tokenState[USDR_MINT_KEY];
}

export function useUpdateRFStates() {
  const context = React.useContext(RFStateContext);

  return context.updateRFState;
}

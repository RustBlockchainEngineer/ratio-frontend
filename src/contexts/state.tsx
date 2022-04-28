import { sleep } from '@project-serum/common';
import React, { useEffect, useState } from 'react';
import {
  calculateRewardByPlatform,
  getGlobalState,
  getLendingPoolByMint,
  getUserState,
  getVaultState,
  USDR_MINT_KEY,
} from '../utils/ratio-lending';
import { TokenAmount } from '../utils/safe-math';
import { calculateRemainingUserDebt, getMint } from '../utils/utils';
import { useUpdateWallet } from './auth';
import { useConnection } from './connection';
import { useVaultsContextProvider } from './vaults';
import { useWallet } from './wallet';

interface RFStateConfig {
  tokenState: any;
  globalState: any;
  poolState: any;
  vaultState: any;
  overview: any;
  updateRFState: (action: UpdateStateType, mint: string) => void;
}

const RFStateContext = React.createContext<RFStateConfig>({
  tokenState: {},
  globalState: {},
  poolState: {},
  vaultState: {},
  overview: {},
  updateRFState: () => {},
});

export declare type UpdateStateType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const UPDATE_GLOBAL_STATE: UpdateStateType = 0;
export const UPDATE_POOL_STATE: UpdateStateType = 1;
export const UPDATE_USER_STATE: UpdateStateType = 2;
export const UPDATE_REWARD_STATE: UpdateStateType = 3;

export function RFStateProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { wallet } = useWallet();
  const { vaults: pools } = useVaultsContextProvider();

  const [globalState, setGlobalState] = useState<any>(null);
  const [poolState, setPoolState] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [tokenState, setTokenState] = useState<any>(null);
  const { updateWalletFlag, setUpdateWalletFlag } = useUpdateWallet();

  const updateRFState = async (action: UpdateStateType, mint = '') => {
    await sleep(3000);
    setUpdateWalletFlag(!updateWalletFlag);

    if (action === UPDATE_GLOBAL_STATE) {
      updateGlobalState();
    } else if (action === UPDATE_POOL_STATE) {
      updatePoolStateByMint(mint);
    } else if (action === UPDATE_USER_STATE) {
      updateVaultStateByMint(mint);
    } else if (action === UPDATE_REWARD_STATE) {
      updateUserRewardByMint(mint);
    }
  };

  const updateMintState = async () => {
    const mintInfos: any = {};
    try {
      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        const mint = pool.address_id;

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

  const updatePoolStates = async () => {
    const poolInfos: any = {};
    try {
      for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        const mint = pool.address_id;

        const poolInfo = await getLendingPoolByMint(connection, mint);
        if (poolInfo) {
          poolInfos[mint] = poolInfo;
        }
      }
      setPoolState(poolInfos);
    } catch (e) {
      console.log(e);
    }
  };

  const updatePoolStateByMint = async (mint: string) => {
    const newState = {
      ...poolState,
    };

    const poolInfo = await getLendingPoolByMint(connection, mint);
    newState[mint] = poolInfo;

    setPoolState(newState);
  };

  const updateUserState = async () => {
    if (!poolState) {
      return;
    }

    try {
      const vaultInfos: any = {};
      for (const mint of Object.keys(poolState)) {
        const poolInfo = poolState[mint];
        const vaultInfo = await getVaultState(connection, wallet, mint);
        if (vaultInfo) {
          vaultInfos[mint] = {
            ...vaultInfo,
            reward: await calculateRewardByPlatform(connection, wallet, mint, poolInfo.platformType),
          };
        }
      }
      setVaultState(vaultInfos);
    } catch (e) {
      console.error(e);
    }
  };

  const updateVaultStateByMint = async (mint: string) => {
    const poolInfo = poolState[mint];
    const vaultInfo = await getVaultState(connection, wallet, mint);

    const newStates = {
      ...vaultState,
    };

    if (vaultInfo) {
      const reward = await calculateRewardByPlatform(connection, wallet, mint, poolInfo.platformType);
      newStates[mint] = {
        ...vaultInfo,
        reward,
      };
    }

    setVaultState(newStates);
  };

  const updateUserRewardByMint = async (mint: string) => {
    const poolInfo = poolState[mint];
    const vaultInfo = vaultState[mint];

    const newStates = {
      ...vaultState,
    };

    if (vaultInfo) {
      const reward = await calculateRewardByPlatform(connection, wallet, mint, poolInfo.platformType);
      newStates[mint] = {
        ...vaultInfo,
        reward,
      };
    }

    setVaultState(newStates);
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
    const userState = await getUserState(connection, wallet);
    const totalDebt = userState ? userState.totalDebt.toNumber() : 0;
    const poolCount = userState ? userState.activeVaults.toNumber() : 0;

    const activeVaults: any = {};

    const usdrMint = await getMint(connection, USDR_MINT_KEY);

    for (const mint of Object.keys(vaultState)) {
      const state = vaultState[mint];

      const pool = pools.find((item) => {
        return item.address_id.toLowerCase() === mint.toLowerCase();
      });

      const riskRating = pool?.risk_rating.toString() || 'D';

      const debtLimit = await calculateRemainingUserDebt(
        Number(process.env.REACT_APP_LP_TOKEN_PRICE), // TODO: fix this
        riskRating,
        state,
        tokenState[mint], // Is the same as vaultState[mint].mintColl.toBase58()
        usdrMint
      );

      if (state && state.lockedCollBalance.toNumber() !== 0) {
        activeVaults[mint] = {
          mint,
          lockedAmount: state.lockedCollBalance.toNumber(),
          debt: state.debt.toNumber(),
          // Warning here, this is another debtLimit, not the userDebtCeiling from the global state
          debtLimit: new TokenAmount(debtLimit * 10 ** 6, 6).toWei().toNumber(),
        };
      }
    }

    setOverview({
      activeVaults,
      totalDebt,
      poolCount,
    });
  };

  useEffect(() => {
    if (connection) {
      updateMintState();
    }
    return () => {
      setTokenState({});
    };
  }, [connection, pools]);

  useEffect(() => {
    if (connection) {
      updateGlobalState();
    }
    return () => {
      setGlobalState({});
    };
  }, [connection]);

  useEffect(() => {
    if (connection && pools) {
      updatePoolStates();
    }
    return () => {
      setPoolState({});
    };
  }, [connection, pools, globalState]);

  useEffect(() => {
    if (connection && wallet && wallet.publicKey) {
      updateUserState();
    }

    return () => {
      setVaultState({});
    };
  }, [connection, wallet, wallet?.publicKey, poolState]);

  useEffect(() => {
    if (connection && wallet && wallet.publicKey) {
      updateOverview();
    }

    return () => {
      setOverview({});
    };
  }, [connection, wallet, wallet?.publicKey, pools, tokenState, vaultState]);

  return (
    <RFStateContext.Provider
      value={{
        tokenState,
        globalState,
        poolState: poolState,
        vaultState: vaultState,
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

  return context.vaultState[mint];
}

export function usePoolInfo(mint: string) {
  const context = React.useContext(RFStateContext);

  return context.poolState[mint];
}

export function useUserOverview() {
  const context = React.useContext(RFStateContext);

  return context.overview;
}

export function useTokenMintInfo(mint: string) {
  const context = React.useContext(RFStateContext);

  return context.tokenState ? context.tokenState[mint] : null;
}

export function useUSDrMintInfo() {
  const context = React.useContext(RFStateContext);

  return context.tokenState ? context.tokenState[USDR_MINT_KEY] : null;
}

export function useUpdateRFStates() {
  const context = React.useContext(RFStateContext);

  return context.updateRFState;
}

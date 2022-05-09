import { sleep } from '@project-serum/common';
import React, { useEffect, useState } from 'react';
import {
  USDR_MINT_DECIMALS,
  calculateRewardByPlatform,
  getAllOracleState,
  getGlobalState,
  getUserState,
  getVaultState,
  COLL_RATIOS_DECIMALS,
  getAllLendingPool,
} from '../utils/ratio-lending';
import { TokenAmount } from '../utils/safe-math';
import { calculateCollateralPrice, getMint } from '../utils/utils';
import { useUpdateWallet } from './auth';
import { useConnection } from './connection';
import { useWallet } from './wallet';

interface RFStateConfig {
  globalState: any;
  oracleState: any;
  poolState: any;
  vaultState: any;
  overview: any;
  updateRFState: (action: UpdateStateType, mint: string) => void;
}

const RFStateContext = React.createContext<RFStateConfig>({
  globalState: {},
  oracleState: {},
  poolState: {},
  vaultState: {},
  overview: {},
  updateRFState: () => {},
});

export declare type UpdateStateType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const UPDATE_GLOBAL_STATE: UpdateStateType = 0;
export const UPDATE_REWARD_STATE: UpdateStateType = 1;

export function RFStateProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { wallet } = useWallet();

  const [globalState, setGlobalState] = useState<any>(null);
  const [oracleState, setOracleState] = useState<any>(null);
  const [poolState, setPoolState] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const { updateWalletFlag, setUpdateWalletFlag } = useUpdateWallet();

  const [isStateLoading, setStateLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateRFState = async (action: UpdateStateType, mint = '') => {
    await sleep(3000);
    setUpdateWalletFlag(!updateWalletFlag);

    if (action === UPDATE_GLOBAL_STATE) {
      updateTotalState();
    } else if (action === UPDATE_REWARD_STATE) {
      updateUserRewardByMint(mint);
    }
  };

  const updateGlobalState = async () => {
    console.log('1. Updating global state...');
    const res = await getGlobalState(connection, wallet);
    let info = null;
    if (res) {
      info = {
        ...res.globalState,
        mintableDebt: Math.max(
          0,
          parseFloat(
            new TokenAmount(
              res.globalState.debtCeilingGlobal.toNumber() - res.globalState.totalDebt.toNumber(),
              USDR_MINT_DECIMALS
            ).fixed()
          )
        ),
      };
      setGlobalState(info);
    }
    return info;
  };

  const updateOracleState = async () => {
    console.log('2. Updating oracle state...');

    const oracles = await getAllOracleState(connection, wallet);
    const oracleInfos: any = {};
    oracles.forEach((item) => {
      const oracle = item.account;
      const oracleMint = oracle.mint.toString();
      oracleInfos[oracleMint] = oracle;
    });
    setOracleState(oracleInfos);
    return oracleInfos;
  };

  const getPoolInfo = async (globalState, oracleState, poolInfo: any) => {
    const mintInfo = await getMint(connection, poolInfo.mintCollat);
    if (poolInfo && mintInfo && oracleState && globalState) {
      const oracleInfoA = oracleState[poolInfo.swapMintA];
      const oracleInfoB = oracleState[poolInfo.swapMintB];
      const lpSupply = parseFloat(new TokenAmount(mintInfo.supply.toString(), mintInfo.decimals).fixed());
      const tokenAmountA = parseFloat(
        new TokenAmount(
          (await connection.getTokenAccountBalance(poolInfo.swapTokenA)).value.amount,
          oracleInfoA.decimals
        ).fixed()
      );
      const tokenAmountB = parseFloat(
        new TokenAmount(
          (await connection.getTokenAccountBalance(poolInfo.swapTokenB)).value.amount,
          oracleInfoB.decimals
        ).fixed()
      );
      const ratio = globalState.collPerRisklv[poolInfo?.riskLevel].toNumber() / 10 ** COLL_RATIOS_DECIMALS;

      const { fairPrice: price } = calculateCollateralPrice(
        lpSupply,
        tokenAmountA,
        oracleInfoA.price.toNumber(),
        tokenAmountB,
        oracleInfoB.price.toNumber()
      );
      poolInfo['tokenAmountA'] = tokenAmountA;
      poolInfo['tokenAmountB'] = tokenAmountB;
      poolInfo['oraclePrice'] = price;
      poolInfo['currentPrice'] = new TokenAmount(price, USDR_MINT_DECIMALS).fixed();
      poolInfo['ratio'] = ratio;
      poolInfo['mintDecimals'] = mintInfo.decimals;
      poolInfo['mintSupply'] = mintInfo.supply;
    }
    return poolInfo;
  };

  const updatePoolState = async (globalState, oracleState) => {
    console.log('3. Updating pool state...');

    const poolInfos: any = {};
    try {
      const allPools = await getAllLendingPool(connection);
      for (let i = 0; i < allPools.length; i++) {
        const pool = allPools[i].account;
        const mint = pool.mintCollat.toString();

        const poolInfo = await getPoolInfo(globalState, oracleState, pool);
        if (poolInfo) {
          poolInfos[mint] = poolInfo;
        }
      }
    } catch (e) {
      console.log(e);
    }
    setPoolState(poolInfos);
    return poolInfos;
  };

  const updateOverview = async () => {
    console.log('4. Updating overview.....');

    const userState = await getUserState(connection, wallet);
    const info = userState ?? null;
    setOverview(info);
    return info;
  };

  const getVaultStateByMint = async (globalState, poolState, overview, mint: string) => {
    const vaultInfo = await getVaultState(connection, wallet, mint);

    if (
      overview.totalDebt &&
      globalState.debtCeilingUser &&
      globalState.debtCeilingGlobal &&
      globalState.totalDebt &&
      vaultInfo
    ) {
      const poolInfo = poolState[mint];
      const reward = await calculateRewardByPlatform(connection, wallet, mint, poolInfo.platformType);

      const lockedColl = parseFloat(new TokenAmount(vaultInfo.totalColl.toString(), poolInfo.mintDecimals).fixed());

      const debtLimit = poolInfo.oraclePrice * lockedColl * poolInfo.ratio;
      const vaultDebtLimit = debtLimit - vaultInfo.debt.toNumber();
      const userDebtLimit = globalState.debtCeilingUser.toNumber() - overview.totalDebt.toNumber();
      const poolDebtLimit = poolInfo.debtCeiling.toNumber() - poolInfo.totalDebt.toNumber();
      const globalDebtLimit = globalState.debtCeilingGlobal.toNumber() - globalState.totalDebt.toNumber();
      const mintableDebt = Math.max(0, Math.min(vaultDebtLimit, userDebtLimit, poolDebtLimit, globalDebtLimit));

      return {
        ...vaultInfo,
        mint,
        reward,
        lockedAmount: vaultInfo.totalColl.toNumber(),
        debt: vaultInfo.debt.toNumber(),
        debtLimit: new TokenAmount(debtLimit, USDR_MINT_DECIMALS).toWei().toNumber(),
        mintableDebt: new TokenAmount(mintableDebt, USDR_MINT_DECIMALS).toWei().toNumber(),
        isReachedDebt: mintableDebt <= 0 && vaultInfo.debt.toNumber() > 0,
        pool: poolInfo,
      };
    }
    return null;
  };

  const updateVaultState = async (globalState, poolState, overview) => {
    console.log('5. Updating vaults.....');
    const vaultInfos: any = {};
    try {
      for (const mint of Object.keys(poolState)) {
        const vaultInfo = await getVaultStateByMint(globalState, poolState, overview, mint);
        if (vaultInfo) {
          vaultInfos[mint] = {
            ...vaultInfo,
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
    setVaultState(vaultInfos);
    return vaultInfos;
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

  const updateTotalState = async () => {
    setStateLoading(true);

    const globalState = await updateGlobalState();
    const oracleState = await updateOracleState();
    const poolState = await updatePoolState(globalState, oracleState);
    const overview = await updateOverview();
    if (overview) {
      await updateVaultState(globalState, poolState, overview);
    }

    setStateLoading(false);
  };
  useEffect(() => {
    if (wallet && wallet.publicKey && connection && !isStateLoading) {
      updateTotalState();
    }

    return () => {
      setVaultState(null);
    };
  }, [wallet, wallet?.publicKey, connection]);

  return (
    <RFStateContext.Provider
      value={{
        globalState,
        oracleState,
        poolState,
        vaultState,
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

export function useUserVaultInfo(mint: string) {
  const context = React.useContext(RFStateContext);

  return context.vaultState ? context.vaultState[mint] : null;
}

export function useAllPoolInfo() {
  const context = React.useContext(RFStateContext);

  return context.poolState;
}

export function usePoolInfo(mint: string) {
  const context = React.useContext(RFStateContext);

  return context.poolState ? context.poolState[mint] : null;
}
export function useOracleInfo(mint: string) {
  const context = React.useContext(RFStateContext);

  return context.oracleState[mint];
}

export function useAllOracleInfo() {
  const context = React.useContext(RFStateContext);
  return context.oracleState;
}

export function useUserOverview() {
  const context = React.useContext(RFStateContext);

  return context.overview;
}

export function useAllVaultInfo() {
  const context = React.useContext(RFStateContext);

  return context.vaultState;
}

export function useIsActiveUserVault(mint: string) {
  const context = React.useContext(RFStateContext);
  if (context.vaultState && context.vaultState[mint] && context.vaultState[mint]?.totalColl)
    return context.vaultState[mint]?.totalColl.toNumber() !== 0;
  else return false;
}

export function useUpdateRFStates() {
  const context = React.useContext(RFStateContext);

  return context.updateRFState;
}

import { SABER_IOU_MINT, SBR_MINT } from '@saberhq/saber-periphery';
import { SignatureResult } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { API_ENDPOINT, REFRESH_TIME_INTERVAL } from '../constants';
import {
  USDR_MINT_DECIMALS,
  calculateRewardByPlatform,
  getAllOracleState,
  getGlobalState,
  getUserState,
  getVaultState,
  COLL_RATIOS_DECIMALS,
  getAllLendingPool,
  // USD_FAIR_PRICE,
  getLendingPoolByMint,
  getFarmInfoByPlatform,
} from '../utils/ratio-lending';
import { getBalanceChange, postToRatioApi, prepareTransactionData, TxStatus } from '../utils/ratioApi';
import { SABER_IOU_MINT_DECIMALS } from '../utils/PoolInfoProvider/saber/saber-utils';
import { TokenAmount } from '../utils/safe-math';
import { calculateCollateralPrice, getMint } from '../utils/utils';
import { useConnection } from './connection';
import { useWallet } from './wallet';

const mintList = [];
let actionList = [];
const UPDATE_ALL = 'UPDATE_ALL';
let isStateLoading = false;
interface RFStateConfig {
  globalState: any;
  oracleState: any;
  poolState: any;
  vaultState: any;
  overview: any;
  appendUserAction: (
    walletKey: string,
    mintCollat: string,
    affectedMint: string,
    action: string,
    amount: number,
    txid: string
  ) => void;
}

const RFStateContext = React.createContext<RFStateConfig>({
  globalState: {},
  oracleState: {},
  poolState: {},
  vaultState: {},
  overview: {},
  appendUserAction: () => {},
});

export function RFStateProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { wallet } = useWallet();

  const [globalState, setGlobalState] = useState<any>(null);
  const [oracleState, setOracleState] = useState<any>(null);
  const [poolState, setPoolState] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  const [updateFinished, setUpdateFinished] = useState(false);
  const [toogleUpdateState, setToogleUpdateState] = useState(false);
  const [walletUpdated, setWalletUpdated] = useState(false);

  const appendUserAction = async (
    walletKey: string,
    mintCollat: string,
    affectedMint: string,
    action: string,
    amount: number,
    txHash: string
  ) => {
    if (!txHash) return;
    postToRatioApi(
      prepareTransactionData(action, mintCollat, affectedMint, amount, txHash, 'Waiting Confirmation ...'),
      `/transaction/${walletKey}/new`
    )
      .then(() => {})
      .catch((e) => {
        console.log(e);
      });
    connection.onSignature(
      txHash,
      async function (signatureResult: SignatureResult) {
        let newStatus: TxStatus = 'Failed';
        if (!signatureResult.err) {
          newStatus = 'Success';
          console.log('Transaction confirmed', txHash);
        } else {
          console.log('Transaction failed', txHash);
        }
        const txInfo = await connection.getTransaction(txHash, { commitment: 'confirmed' });
        const newAmount = getBalanceChange(txInfo, walletKey, affectedMint);
        if (newAmount) {
          postToRatioApi(
            prepareTransactionData(action, mintCollat, affectedMint, newAmount, txHash, newStatus),
            `/transaction/${walletKey}/update`
          )
            .then(() => {})
            .catch((e) => {
              console.log(e);
            });
        }
      },
      'confirmed'
    );

    mintList.push(mintCollat);
  };
  const updateGlobalState = async () => {
    const state = await getGlobalState(connection, wallet);
    let info = globalState ?? {};
    if (state) {
      info = {
        ...state,
        mintableUSDr: Math.max(
          0,
          parseFloat(
            new TokenAmount(state.debtCeilingGlobal.toNumber() - state.totalDebt.toNumber(), USDR_MINT_DECIMALS).fixed()
          )
        ),
      };
    }
    setGlobalState(info);
    return info;
  };

  const updateOracleState = async () => {
    const oracles = await getAllOracleState(connection, wallet);
    const oracleInfos: any = oracleState ?? {};
    oracles.forEach((item) => {
      const oracle = item.account;
      const oracleMint = oracle.mint.toString();
      oracleInfos[oracleMint] = oracle;
    });

    const response = await fetch(`${API_ENDPOINT}/coingecko/saberprice`);
    oracleInfos[SBR_MINT] = await response.json();

    setOracleState(oracleInfos);

    return oracleInfos;
  };

  const getPoolInfo = async (globalState, oracleState, poolInfo: any) => {
    const mintInfo = await getMint(connection, poolInfo.mintCollat);
    if (poolInfo && mintInfo && oracleState && globalState && !poolInfo.isPaused) {
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

      const { fairPrice, virtualPrice } = calculateCollateralPrice(
        lpSupply,
        tokenAmountA,
        oracleInfoA.price.toNumber(),
        tokenAmountB,
        oracleInfoB.price.toNumber()
      );

      poolInfo.realUserRewardMint =
        poolInfo.mintReward.toString() === SABER_IOU_MINT.toString() ? SBR_MINT : poolInfo.mintReward.toString();

      // const activePrice = USD_FAIR_PRICE ? fairPrice : virtualPrice;
      const activePrice = virtualPrice;

      poolInfo['fairPrice'] = fairPrice;
      poolInfo['virtualPrice'] = virtualPrice;

      poolInfo['oraclePrice'] = activePrice;
      poolInfo['currentPrice'] = +new TokenAmount(activePrice, USDR_MINT_DECIMALS).fixed();

      poolInfo['ratio'] = ratio;
      poolInfo['tokenAmountA'] = tokenAmountA;
      poolInfo['tokenAmountB'] = tokenAmountB;
      poolInfo['mintDecimals'] = mintInfo.decimals;
      poolInfo['mintSupply'] = mintInfo.supply;

      poolInfo['farmInfo'] = await getFarmInfoByPlatform(connection, poolInfo.mintCollat, poolInfo.platformType);
      poolInfo['farmTVL'] =
        +new TokenAmount(virtualPrice, USDR_MINT_DECIMALS).fixed() *
        +new TokenAmount(poolInfo['farmInfo'].totalTokensDeposited, mintInfo.decimals).fixed();
      poolInfo['farmAPY'] =
        ((oracleState[SBR_MINT] *
          new TokenAmount(poolInfo['farmInfo'].annualRewardsRate, SABER_IOU_MINT_DECIMALS).toEther().toNumber()) /
          poolInfo['farmTVL']) *
        100;
    }
    return poolInfo;
  };

  const updatePoolStateByMint = async (globalState, oracleState, mint) => {
    const poolInfos: any = poolState ?? {};
    try {
      const pool = await getLendingPoolByMint(connection, mint);
      const poolInfo = await getPoolInfo(globalState, oracleState, pool);
      if (poolInfo) {
        poolInfos[mint] = poolInfo;
      }
    } catch (e) {
      console.log(e);
    }
    setPoolState(poolInfos);
    return poolInfos;
  };

  const updateAllPoolState = async (globalState, oracleState) => {
    const poolInfos: any = poolState ?? {};
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
    const userState = await getUserState(connection, wallet);
    setOverview(userState);
    return userState;
  };

  const getVaultStateByMint = async (globalState, oracleState, poolInfo, overview, mint: string) => {
    const vaultInfo = await getVaultState(connection, wallet, mint);
    if (
      globalState.debtCeilingUser &&
      globalState.debtCeilingGlobal &&
      globalState.totalDebt &&
      overview.totalDebt &&
      poolInfo &&
      vaultInfo
    ) {
      const reward = await calculateRewardByPlatform(connection, wallet, mint, poolInfo.platformType);

      const lockedColl = parseFloat(new TokenAmount(vaultInfo.totalColl.toString(), poolInfo.mintDecimals).fixed());
      const tvlUsd = poolInfo.oraclePrice * lockedColl;
      const debtLimit = tvlUsd * poolInfo.ratio;
      const vaultDebtLimit = debtLimit - vaultInfo.debt.toNumber();
      const userDebtLimit = globalState.debtCeilingUser.toNumber() - overview.totalDebt.toNumber();
      const poolDebtLimit = poolInfo.debtCeiling.toNumber() - poolInfo.totalDebt.toNumber();
      const globalDebtLimit = globalState.debtCeilingGlobal.toNumber() - globalState.totalDebt.toNumber();
      const mintableUSDr = Math.max(0, Math.min(vaultDebtLimit, userDebtLimit, poolDebtLimit, globalDebtLimit));

      return {
        ...vaultInfo,
        mint,
        reward,
        tvlUsd,
        rewardUSD: new TokenAmount(oracleState[SBR_MINT] * reward, USDR_MINT_DECIMALS, false).fixed(),
        lockedAmount: vaultInfo.totalColl.toNumber(),
        debt: vaultInfo.debt.toNumber(),
        debtLimit: new TokenAmount(debtLimit, USDR_MINT_DECIMALS).toWei().toNumber(),
        mintableUSDr: new TokenAmount(mintableUSDr, USDR_MINT_DECIMALS).toWei().toNumber(),
        isReachedDebt: mintableUSDr <= 0 && vaultInfo.debt.toNumber() > 0,
        poolInfo,
      };
    }
    return null;
  };

  const updateAllVaultState = async (globalState, oracelState, poolState, overview) => {
    const vaultInfos: any = vaultState ?? {};
    if (overview) {
      for (const mint of Object.keys(poolState)) {
        const vaultInfo = await getVaultStateByMint(globalState, oracelState, poolState[mint], overview, mint);
        if (vaultInfo) {
          vaultInfos[mint] = {
            ...vaultInfo,
          };
        }
      }
    }

    setVaultState(vaultInfos);
    return vaultInfos;
  };

  const updateVaultStateByMint = async (globalState, oracleState, poolInfo, overview, mint) => {
    const vaultInfos: any = vaultState ?? {};
    if (overview) {
      const vaultInfo = await getVaultStateByMint(globalState, oracleState, poolInfo, overview, mint);
      if (vaultInfo) {
        vaultInfos[mint] = {
          ...vaultInfo,
        };
      }
    }

    setVaultState(vaultInfos);
    return vaultInfos;
  };

  const updateRFStateByMint = async (mint) => {
    console.log('----- Updating state by mint -----');
    await updateVaultStateByMint(globalState, oracleState, poolState[mint], overview, mint);

    const newGlobalState = await updateGlobalState();
    const newOracleState = await updateOracleState();
    const newPoolState = await updatePoolStateByMint(newGlobalState, newOracleState, mint);
    const newOverview = await updateOracleState();
    await updateVaultStateByMint(newGlobalState, newOracleState, newPoolState[mint], newOverview, mint);
    console.log('***** Updated state by mint *****');
  };

  const updateRFStateOverall = async () => {
    console.log('----- Updating all state -----');
    const globalState = await updateGlobalState();
    const oracleState = await updateOracleState();
    const poolState = await updateAllPoolState(globalState, oracleState);
    const overview = await updateOverview();
    await updateAllVaultState(globalState, oracleState, poolState, overview);

    console.log('***** Updated all state *****');
  };

  const updateRFState = async () => {
    if (!isStateLoading) {
      if (!actionList.length) {
        console.log('Pending action is empty');
        return;
      }
      isStateLoading = true;
      let activeAction = actionList[actionList.length - 1];
      if (actionList.indexOf(UPDATE_ALL) !== -1) {
        activeAction = UPDATE_ALL;
      }
      if (activeAction === UPDATE_ALL) {
        actionList = [];
      } else {
        actionList = actionList.filter((item, index) => actionList.indexOf(item) === index);
        actionList = actionList.slice(0, actionList.length - 1);
      }

      if (activeAction === UPDATE_ALL) {
        await updateRFStateOverall();
      } else {
        await updateRFStateByMint(activeAction);
      }
      isStateLoading = false;
      setUpdateFinished((prev) => !prev);
    }
  };

  useEffect(() => {
    setInterval(() => {
      setToogleUpdateState((prev) => !prev);
    }, 1000 * REFRESH_TIME_INTERVAL);
  }, []);

  useEffect(() => {
    console.log('Updated is toggled');
    actionList.push(UPDATE_ALL);
    updateRFState();
    return () => {};
  }, [toogleUpdateState]);

  useEffect(() => {
    if (actionList.length) {
      updateRFState();
    }
  }, [updateFinished]);

  useEffect(() => {
    if (wallet && wallet.publicKey && connection) {
      console.log('Wallet is connected');
      actionList.push(UPDATE_ALL);
      updateRFState();

      connection.onAccountChange(wallet.publicKey, (acc) => {
        if (acc) {
          setWalletUpdated((prev) => !prev);
        }
      });
    }

    return () => {
      setVaultState(null);
    };
  }, [wallet, wallet?.publicKey, connection]);

  useEffect(() => {
    if (wallet && wallet.publicKey && connection) {
      console.log('Wallet is updated');
      if (mintList.length > 0) {
        actionList.push(mintList[0]);
        mintList.splice(0, 1);
      } else {
        actionList.push(UPDATE_ALL);
      }
      updateRFState();
    }
  }, [walletUpdated]);

  return (
    <RFStateContext.Provider
      value={{
        globalState,
        oracleState,
        poolState,
        vaultState,
        overview,
        appendUserAction: appendUserAction,
      }}
    >
      {children}
    </RFStateContext.Provider>
  );
}

// function useRFState() {
//   const context = React.useContext(RFStateContext);
//   if (!context) {
//     throw new Error('[useRFState] Hook not used under Vaults context provider');
//   }
//   return context;
// }

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
// function useOracleInfo(mint: string) {
//   const context = React.useContext(RFStateContext);

//   return context.oracleState[mint];
// }

// function useAllOracleInfo() {
//   const context = React.useContext(RFStateContext);
//   return context.oracleState;
// }

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

export function useAppendUserAction() {
  const context = React.useContext(RFStateContext);

  return context.appendUserAction;
}

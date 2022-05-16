import { SABER_IOU_MINT, SBR_MINT } from '@saberhq/saber-periphery';
import { SignatureResult } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { REFRESH_TIME_INTERVAL } from '../constants';
import { useFetchSaberPrice } from '../hooks/useCoinGeckoPrices';
import {
  USDR_MINT_DECIMALS,
  calculateRewardByPlatform,
  getAllOracleState,
  getGlobalState,
  getUserState,
  getVaultState,
  COLL_RATIOS_DECIMALS,
  getAllLendingPool,
  USD_FAIR_PRICE,
  getLendingPoolByMint,
  getFarmInfoByPlatform,
} from '../utils/ratio-lending';
import { getBalanceChange, postToRatioApi, prepareTransactionData, TxStatus } from '../utils/ratioApi';
import { SABER_IOU_MINT_DECIMALS } from '../utils/saber/saber-utils';
import { TokenAmount } from '../utils/safe-math';
import { calculateCollateralPrice, getMint } from '../utils/utils';
import { useConnection } from './connection';
import { useWallet } from './wallet';

const actionList = [];
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
  const { saberPrice } = useFetchSaberPrice();

  const [globalState, setGlobalState] = useState<any>(null);
  const [oracleState, setOracleState] = useState<any>(null);
  const [poolState, setPoolState] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [vaultState, setVaultState] = useState<any>(null);

  const [isStateLoading, setStateLoading] = useState(false);
  const [toogleUpdateState, setToogleUpdateState] = useState(false);
  const [walletUpdated, setWalletUpdated] = useState(false);
  const [mintToUpdate, setMintToUpdate] = useState({
    mint: '',
    signal: false,
  });

  const appendUserAction = async (
    walletKey: string,
    mintCollat: string,
    affectedMint: string,
    action: string,
    amount: number,
    txHash: string
  ) => {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async function (signatureResult: SignatureResult) {
        let newStatus: TxStatus = 'Failed';
        if (!signatureResult.err) {
          newStatus = 'Success';
          console.log('Transaction confirmed', txHash);
        } else {
          console.log('Transaction failed', txHash);
        }
        const txInfo = await connection.getTransaction(
          '5K97wy6uSCqUQPg2uZK3GgVvCzYuLAKzMJ9GqFUxVhBJzYg61cjbF4LSZojFKpJE4HNsQ4HK4hr1hH1fALesW4RX',
          { commitment: 'confirmed' }
        );
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

    actionList.push({
      mint: mintCollat,
    });
  };
  const updateGlobalState = async () => {
    console.log('1. Updating global state...');
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
    console.log('2. Updating oracle state...');

    const oracles = await getAllOracleState(connection, wallet);
    const oracleInfos: any = oracleState ?? {};
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

      const activePrice = USD_FAIR_PRICE ? fairPrice : virtualPrice;

      poolInfo['fairPrice'] = fairPrice;
      poolInfo['virtualPrice'] = virtualPrice;

      poolInfo['oraclePrice'] = activePrice;
      poolInfo['currentPrice'] = +new TokenAmount(activePrice, USDR_MINT_DECIMALS).fixed();

      poolInfo['ratio'] = ratio;
      poolInfo['tokenAmountA'] = tokenAmountA;
      poolInfo['tokenAmountB'] = tokenAmountB;
      poolInfo['mintDecimals'] = mintInfo.decimals;
      poolInfo['mintSupply'] = mintInfo.supply;
      poolInfo['platformTVL'] = poolInfo['currentPrice'] * lpSupply;

      poolInfo['farmInfo'] = await getFarmInfoByPlatform(connection, poolInfo.mintCollat, poolInfo.platformType);
      poolInfo['platformAPY'] =
        ((saberPrice *
          new TokenAmount(poolInfo['farmInfo'].annualRewardsRate, SABER_IOU_MINT_DECIMALS).toEther().toNumber()) /
          poolInfo['platformTVL']) *
        100;
    }
    return poolInfo;
  };

  const updatePoolStateByMint = async (globalState, oracleState, mint) => {
    console.log('3. Updating pool state by mint...');

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
    console.log('3. Updating pool state...');

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

  const updateAllPoolStateForAPY = async () => {
    if (!saberPrice || !poolState) return;
    console.log('Updating Pool APY...');

    const poolInfos: any = poolState ?? {};
    for (const mint of Object.keys(poolState)) {
      const poolInfo = poolState[mint];
      if (poolInfo && !poolInfo.isPaused) {
        poolInfo['platformAPY'] =
          ((saberPrice *
            new TokenAmount(poolInfo['farmInfo'].annualRewardsRate, SABER_IOU_MINT_DECIMALS).toEther().toNumber()) /
            poolInfo['platformTVL']) *
          100;
        poolInfos[mint] = {
          ...poolInfo,
        };
      }
    }

    setPoolState(poolInfos);
    return poolInfos;
  };

  const updateOverview = async () => {
    console.log('4. Updating overview.....');

    const userState = await getUserState(connection, wallet);
    setOverview(userState);
    return userState;
  };

  const getVaultStateByMint = async (globalState, poolInfo, overview, mint: string) => {
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

      const debtLimit = poolInfo.oraclePrice * lockedColl * poolInfo.ratio;
      const vaultDebtLimit = debtLimit - vaultInfo.debt.toNumber();
      const userDebtLimit = globalState.debtCeilingUser.toNumber() - overview.totalDebt.toNumber();
      const poolDebtLimit = poolInfo.debtCeiling.toNumber() - poolInfo.totalDebt.toNumber();
      const globalDebtLimit = globalState.debtCeilingGlobal.toNumber() - globalState.totalDebt.toNumber();
      const mintableUSDr = Math.max(0, Math.min(vaultDebtLimit, userDebtLimit, poolDebtLimit, globalDebtLimit));

      return {
        ...vaultInfo,
        mint,
        reward,
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

  const updateAllVaultState = async (globalState, poolState, overview) => {
    console.log('5. Updating vaults.....');
    const vaultInfos: any = vaultState ?? {};
    if (overview) {
      for (const mint of Object.keys(poolState)) {
        const vaultInfo = await getVaultStateByMint(globalState, poolState[mint], overview, mint);
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

  const updateVaultStateByMint = async (globalState, poolInfo, overview, mint) => {
    console.log('5. Updating vault by mint.....');

    const vaultInfos: any = vaultState ?? {};
    if (overview) {
      const vaultInfo = await getVaultStateByMint(globalState, poolInfo, overview, mint);
      if (vaultInfo) {
        vaultInfos[mint] = {
          ...vaultInfo,
        };
      }
    }

    setVaultState(vaultInfos);
    return vaultInfos;
  };

  useEffect(() => {
    updateAllPoolStateForAPY();
    return () => {};
  }, [saberPrice]);

  useEffect(() => {
    setInterval(() => {
      setToogleUpdateState((prev) => !prev);
    }, 1000 * REFRESH_TIME_INTERVAL);
  }, []);

  useEffect(() => {
    console.log('Updated is toggled ....................');
    updateRFState();
    return () => {};
  }, [toogleUpdateState]);

  const updateRFStateByMint = async (mint) => {
    console.log('***** Updating state by mint*****');
    const newGlobalState = await updateGlobalState();
    const newOracleState = await updateOracleState();
    const newPoolState = await updatePoolStateByMint(newGlobalState, newOracleState, mint);
    const newOverview = await updateOracleState();
    await updateVaultStateByMint(newGlobalState, newPoolState[mint], newOverview, mint);
    console.log('***** Updated state by mint*****');
  };

  const updateRFState = async () => {
    if (!isStateLoading) {
      setStateLoading(true);
      //we can't determine which vault is updated;
      if (actionList.length === 0) {
        console.log('***** Updating all state *****');

        const globalState = await updateGlobalState();
        const oracleState = await updateOracleState();
        const poolState = await updateAllPoolState(globalState, oracleState);
        const overview = await updateOverview();
        await updateAllVaultState(globalState, poolState, overview);

        console.log('***** Updated all state *****');
      } else {
        const lastAction = actionList[0];
        console.log('**** Updating the vault first ****', lastAction.mint);
        await updateVaultStateByMint(globalState, poolState[lastAction.mint], overview, lastAction.mint);
        setMintToUpdate((prev) => {
          return {
            mint: lastAction.mint,
            signal: !prev.signal,
          };
        });
      }
      setStateLoading(false);
    }
  };

  useEffect(() => {
    if (mintToUpdate.mint) {
      updateRFStateByMint(mintToUpdate.mint);
      const index = actionList.indexOf(mintToUpdate.mint);
      actionList.splice(index, 1);
    }
  }, [mintToUpdate]);

  useEffect(() => {
    if (wallet && wallet.publicKey && connection) {
      console.log('Wallet is updated ....................');
      updateRFState();

      connection.onAccountChange(wallet.publicKey, (acc) => {
        if (acc) {
          console.log('Changing RFState since the wallet is updated');
          setWalletUpdated((prev) => !prev);
        }
      });
    }

    return () => {
      setVaultState(null);
    };
  }, [wallet, wallet?.publicKey, connection, walletUpdated]);

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

export function useAppendUserAction() {
  const context = React.useContext(RFStateContext);

  return context.appendUserAction;
}

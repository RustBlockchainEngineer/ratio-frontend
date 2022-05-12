/* eslint-disable */
import React, { useContext, useEffect, useState } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { useConnection, useConnectionConfig } from './connection';
import { useSaberPools, useOrcaPools, useRaydiumPools, useMercurialPools } from './pools';
import _ from 'lodash-es';
import { QUARRY_INFO_LAYOUT } from '../utils/layout';
import { TokenAmount } from '../utils/safe-math';
import { SBR_DECIMALS } from '../utils/saber/constants';
import { useFetchSaberPrice } from '../hooks/useCoinGeckoPrices';
import { useAllOracleInfo, useAllPoolInfo } from './state';
import { USDR_MINT_DECIMALS } from '../utils/ratio-lending';

interface PlatformConfig {
  saberFarmsTvlData: any;
  updateTvlByMint: (name: string, mint: string) => void;
}

const PlatformTvlContext = React.createContext<PlatformConfig>({
  saberFarmsTvlData: {},
  updateTvlByMint: () => {},
});

// const log = (...params) => console.log('PlatformTvlProvider', ...params);

export function PlatformTvlProvider({ children = undefined as any }) {
  const connection = useConnection();
  const { saberPrice, status: saberPriceStatus, error: saberPriceError } = useFetchSaberPrice();

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [saberFarmsTvlData, setSaberFarmsTvlData] = useState<any>({});
  const [update, toggleUpdate] = useState<boolean>(true);

  const saberPoolsInfo = useSaberPools();
  const oracleState = useAllOracleInfo();
  const poolState = useAllPoolInfo();

  const calcTvl = (mint: string, tvlData: FarmsTvlData) => {
    if (!poolState || !oracleState || !poolState[mint]) {
      return {
        tvl: tvlData.tvl,
        apy: tvlData.apy,
      };
    }
    const poolInfo = poolState[mint];
    const oracleInfoA = oracleState[poolInfo.swapMintA];
    const oracleInfoB = oracleState[poolInfo.swapMintB];
    const lpSupply = new TokenAmount(poolInfo.mintSupply.toString(), poolInfo.mintDecimals).toEther().toNumber();
    const lpPrice =
      (poolInfo.tokenAmountA * oracleInfoA.price.toNumber() + poolInfo.tokenAmountB * oracleInfoB.price.toNumber()) /
      lpSupply /
      Math.pow(10, USDR_MINT_DECIMALS);

    const tvl = lpPrice * tvlData.totalTokensDeposited.toEther().toNumber();
    const apy = ((saberPrice * tvlData.annualRewardsRate.toEther().toNumber()) / tvl) * 100;
    return {
      tvl: Number(tvl).toFixed(2),
      apy,
    };
  };

  const updateTvlByMint = (platformName: string, mint: string) => {
    // log ('updateTvlByMint', platformName, mint);
    if (platformName === 'SABER') updateSaberTvlByMint(mint);
  };

  const updateAllTVLs = () => {
    // log ('updateTvlByMint', platformName, mint);
    updateSaberTvls();
    // updateRaydiumTvls
    // updateOrcaTvls
  };

  // this is for updating saber tvl for specific mint
  // there might be
  // updateOrcaTvlByMint
  // updateRaydiumTvlByMint
  // updateMercurialTvlByMint
  const updateSaberTvlByMint = async (mint: string) => {
    const updatedData = saberFarmsTvlData;
    updatedData[mint] = await updateSaberFarm(connection, updatedData[mint]);
    const { tvl, apy } = calcTvl(mint, updatedData[mint]);
    if (tvl) updatedData[mint].tvl = tvl;
    if (apy) updatedData[mint].apy = apy;
    setSaberFarmsTvlData(updatedData);
  };

  const updateSaberTvls = async () => {
    analyzeQuarryAccounts(connection, saberFarmsTvlData).then((newTvlData) => {
      _.keys(saberFarmsTvlData).forEach((mint) => {
        const { tvl, apy } = calcTvl(mint, newTvlData[mint]);
        if (tvl) newTvlData[mint].tvl = tvl;
        if (apy) newTvlData[mint].apy = apy;
      });
      setSaberFarmsTvlData(newTvlData);
    });
  };

  /// This useEffect is for initialization of saber farms tvl
  /// saberPoolsInfo will only be inited once, so this useEffect will occur only 1 time
  useEffect(() => {
    // set Saber Farms TVL
    if (saberPoolsInfo && !isInitialized) {
      initSaberFarms(connection, saberPoolsInfo).then((saberQuarryFarmsInfo) => {
        setSaberFarmsTvlData(saberQuarryFarmsInfo);
        if (saberPoolsInfo.length > 0) setIsInitialized(true);
      });
    }
  }, [saberPoolsInfo]);

  /// This useEffect is for updating saber farms tvl every 5 minutes.
  /// Need to pull data from quarry accounts for every 5 minutes.
  useEffect(() => {
    // set Saber Farms TVL
    if (isInitialized) {
      updateAllTVLs();
    }
  }, [update]);

  // We update tvl every 2 minutes
  useEffect(() => {
    setInterval(() => {
      toggleUpdate((update) => !update);
    }, 2000 * 60);
  }, []);

  // Update USD calculation of TVL and APY
  // This only involves arithmetic operations.
  useEffect(() => {
    let updatedData = saberFarmsTvlData;
    _.keys(saberFarmsTvlData).forEach((mint) => {
      const { tvl, apy } = calcTvl(mint, updatedData[mint]);
      if (tvl) updatedData[mint].tvl = tvl;
      if (apy) updatedData[mint].apy = apy;
    });
    setSaberFarmsTvlData(updatedData);
  }, [saberPrice, oracleState, poolState]);

  return (
    <PlatformTvlContext.Provider
      value={{
        saberFarmsTvlData,
        updateTvlByMint,
      }}
    >
      {children}
    </PlatformTvlContext.Provider>
  );
}

export function useSaberTvlData() {
  const context = React.useContext(PlatformTvlContext);
  return context.saberFarmsTvlData;
}

export function useUpdateTvl() {
  const context = React.useContext(PlatformTvlContext);
  return context.updateTvlByMint;
}

// analyze quarry account to get updated tvl and apy
async function updateSaberFarm(connection: Connection, tvlData: any) {
  // log ('updateSaberFarm');
  let quarryInfo = await connection.getAccountInfo(new PublicKey(tvlData.quarryAddress));
  const parsedData = QUARRY_INFO_LAYOUT.decode(quarryInfo.data);
  const updatedData = {
    ...tvlData,
    totalTokensDeposited: new TokenAmount(parsedData.totalTokensDeposited.toString(), parsedData.tokenMintDecimals),
    annualRewardsRate: new TokenAmount(parsedData.annualRewardsRate.toString(), SBR_DECIMALS),
  };
  return updatedData;
}

async function initSaberFarms(connection: Connection, saberPoolsInfo: any) {
  const saberQuarryFarmsInfo: FarmsTvlData[] = [];
  const quarryKeys: PublicKey[] = [];
  for (let i = 0; i < saberPoolsInfo.length; i++) {
    quarryKeys.push(new PublicKey(saberPoolsInfo[i].quarryAddress));
  }
  // quarryKeys length is equal to saber vault count.
  let quarryInfos = await connection.getMultipleAccountsInfo(quarryKeys);
  for (let i = 0; i < quarryInfos.length; i++) {
    const parsedData = QUARRY_INFO_LAYOUT.decode(quarryInfos[i].data);
    saberQuarryFarmsInfo[`${saberPoolsInfo[i].lpAddress}`] = {
      lpSymbol: saberPoolsInfo[i].name,
      quarryAddress: saberPoolsInfo[i].quarryAddress,
      mint: saberPoolsInfo[i].lpAddress,
      totalTokensDeposited: new TokenAmount(parsedData.totalTokensDeposited.toString(), parsedData.tokenMintDecimals),
      annualRewardsRate: new TokenAmount(parsedData.annualRewardsRate.toString(), SBR_DECIMALS),
      tvl: 0,
      apy: 0,
    };
  }
  return saberQuarryFarmsInfo;
}

async function analyzeQuarryAccounts(connection: Connection, arrSaberFarmsTvlData: FarmsTvlData[]) {
  const quarryKeys: PublicKey[] = [];
  const arrDataValues = _.values(arrSaberFarmsTvlData);
  arrDataValues.forEach((val) => quarryKeys.push(new PublicKey(val.quarryAddress)));
  // quarryKeys length is equal to saber vault count.
  let arrUpdatedData = arrSaberFarmsTvlData;
  let quarryInfos = await connection.getMultipleAccountsInfo(quarryKeys);
  for (let i = 0; i < quarryInfos.length; i++) {
    const parsedData = QUARRY_INFO_LAYOUT.decode(quarryInfos[i].data);
    const tvlData = arrDataValues.find((val) => val.quarryAddress === quarryKeys[i].toString());
    if (tvlData) {
      arrUpdatedData[`${tvlData.mint}`] = {
        ...arrUpdatedData[`${tvlData.mint}`],
        totalTokensDeposited: new TokenAmount(parsedData.totalTokensDeposited.toString(), parsedData.tokenMintDecimals),
        annualRewardsRate: new TokenAmount(parsedData.annualRewardsRate.toString(), SBR_DECIMALS),
      };
    }
  }
  return arrUpdatedData;
}

type FarmsTvlData = {
  lpSymbol: string;
  quarryAddress: string;
  mint: string;
  totalTokensDeposited: TokenAmount;
  annualRewardsRate: TokenAmount;
  tvl: number;
  apy: number;
};

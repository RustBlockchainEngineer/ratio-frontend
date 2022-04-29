import BigNumber from 'bignumber.js';
import BannerMessages from './bannerMessages.json';
import { Banner, BannerIcon } from '../Banner';
import { usePoolInfo, useRFStateInfo, useUserVaultInfo } from '../../contexts/state';
const getTokenCapBanner = (key: string, percentage: number) => {
  const bannerParams = BannerMessages[key];
  if (percentage >= 100) {
    return (
      <Banner
        title={bannerParams.danger.title}
        message={bannerParams.danger.message}
        bannerIcon={BannerIcon.riskLevel}
        className="debt-limit-reached"
      />
    );
  } else {
    return (
      <Banner
        title={bannerParams.warning.title}
        message={bannerParams.warning.message}
        bannerIcon={BannerIcon.warningLevel}
        className="warning-debt-limit-reached"
      />
    );
  }
};

const selectBanner = (poolData: any, userVaultData: any, globalStateData: any) => {
  console.log(poolData);
  const { totalDebt: totalPoolDebt, debtCeiling: poolDebtCeiling } = poolData;
  const { debt: userDebt, debtLimit: userDebtLimit } = userVaultData;

  const {
    totalDebt: globalDebt,
    debtCeilingGlobal: globalDebtLimit,
    tvlUsd: globalTvl,
    tvlCollatCeilingUsd: globalTvlLimit,
  } = globalStateData;

  const poolUSDrDebtPercentage = new BigNumber(totalPoolDebt.toString())
    .multipliedBy(100)
    .dividedBy(poolDebtCeiling.toString())
    .toString();
  const userUSDrDebtPercentage = (userDebt * 100) / userDebtLimit;
  const globalUSDrDebtPercentage = new BigNumber(globalDebt.toString())
    .multipliedBy(100)
    .dividedBy(globalDebtLimit.toString())
    .toString();
  const totalTVLPercentage = new BigNumber(globalTvl.toString())
    .multipliedBy(100)
    .dividedBy(globalTvlLimit.toString())
    .toString();

  if (parseFloat(totalTVLPercentage) >= 80) {
    return getTokenCapBanner('totalTVL', parseFloat(totalTVLPercentage));
  } else if (parseFloat(globalUSDrDebtPercentage) >= 80) {
    return getTokenCapBanner('globalUSDrDebt', parseFloat(globalUSDrDebtPercentage));
  } else if (userUSDrDebtPercentage >= 80) {
    return getTokenCapBanner('userUSDrDebt', userUSDrDebtPercentage);
  } else if (parseFloat(poolUSDrDebtPercentage) >= 80) {
    return getTokenCapBanner('vaultUSDrDebt', parseFloat(poolUSDrDebtPercentage));
  } else {
    return <></>;
  }
};

const TokenCapBanner = ({ mint }: any) => {
  const poolInfo = usePoolInfo(mint);
  const vaultInfo = useUserVaultInfo(mint);
  const globalStateData = useRFStateInfo();

  return selectBanner(poolInfo, vaultInfo, globalStateData);
};

export default TokenCapBanner;

import BigNumber from 'bignumber.js';
import BannerMessages from './bannerMessages.json';
import { Banner, BannerIcon } from '../Banner';
import { useUserOverview, useVaultInfo, useRFStateInfo } from '../../contexts/state';
import { useIsVaultActive } from '../../hooks/useIsVaultActive';
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

const selectBanner = (vaultData: any, userVaultData: any, globalStateData: any) => {
  const { totalDebt: totalPoolDebt, debtCeiling: poolDebtCeiling } = vaultData;
  const { debt: userDebt, debtLimit: userDebtLimit } = userVaultData;
  console.log(userDebt, userDebtLimit);
  const {
    totalDebt: globalDebt,
    debtCeiling: globalDebtCeiling,
    tvl: globalTvl,
    tvlLimit: globalTvlLimit,
  } = globalStateData;

  const poolUSDrDebtPercentage = new BigNumber(totalPoolDebt.toString())
    .multipliedBy(100)
    .dividedBy(poolDebtCeiling.toString())
    .toString();
  const userUSDrDebtPercentage = (userDebt * 100) / userDebtLimit;
  const globalUSDrDebtPercentage = new BigNumber(globalDebt.toString())
    .multipliedBy(100)
    .dividedBy(globalDebtCeiling.toString())
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
  const isVaultActive = useIsVaultActive(mint || '');
  const poolData = useVaultInfo(mint);
  const activeVaults = useUserOverview()?.activeVaults;
  const userPoolData = isVaultActive ? activeVaults[mint] : { debt: 0, debtLimit: 0 };
  const globalStateData = useRFStateInfo();

  return selectBanner(poolData, userPoolData, globalStateData);
};

export default TokenCapBanner;

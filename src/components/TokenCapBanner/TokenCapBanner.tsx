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
  if (poolData && userVaultData && globalStateData) {
    const poolUSDrDebtPercentage = new BigNumber(poolData.totalDebt.toString())
      .multipliedBy(100)
      .dividedBy(poolData.debtCeiling.toString())
      .toString();
    const userUSDrDebtPercentage = (userVaultData.debt * 100) / userVaultData.debtLimit;
    const globalUSDrDebtPercentage = new BigNumber(globalStateData.totalDebt.toString())
      .multipliedBy(100)
      .dividedBy(globalStateData.debtCeilingGlobal.toString())
      .toString();
    const totalTVLPercentage = new BigNumber(globalStateData.tvlUsd.toString())
      .multipliedBy(100)
      .dividedBy(globalStateData.tvlCollatCeilingUsd.toString())
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
  }
  return <></>;
};

const TokenCapBanner = ({ mint }: any) => {
  const poolInfo = usePoolInfo(mint);
  const vaultInfo = useUserVaultInfo(mint);
  const globalStateData = useRFStateInfo();

  return selectBanner(poolInfo, vaultInfo, globalStateData);
};

export default TokenCapBanner;

import BigNumber from 'bignumber.js';
import { Banner, BannerIcon } from '../Banner';
import { useUserOverview, useVaultInfo, useRFStateInfo } from '../../contexts/state';

const bannerMessages = {
  vaultUSDrDebt: {
    danger: {
      title: 'Vault Mintable USDr Limit Reached:',
      message: 'You cannot mint USDr',
    },
    warning: {
      title: 'Vault Mintable USDr Warning:',
      message: 'This vault is approaching the maximum Vault Mintable USDr limit',
    },
  },
  userUSDrDebt: {
    danger: {
      title: 'My Mintable USDr Limit Reached:',
      message: ' You cannot mint USDr',
    },
    warning: {
      title: 'My Mintable USDr Warning:',
      message: 'You are approaching the maximum Mintable USDr limit',
    },
  },
  globalUSDrDebt: {
    danger: {
      title: 'Total Mintable USDr Limit Reached:',
      message: 'You cannot mint USDr',
    },
    warning: {
      title: 'Total Mintable USDr Warning:',
      message: 'The maximum Mintable USDr limit is approaching',
    },
  },
  totalTVL: {
    danger: {
      title: 'Total TVL Limit Reached:',
      message: 'You cannot deposit LP',
    },
    warning: {
      title: 'Total TVL Limit Warning:',
      message: 'The maximum TVL limit is approaching',
    },
  },
};

const getTokenCapBanner = (key: string, percentage: number) => {
  const bannerParams = bannerMessages[`${key}`];
  if (percentage >= 100) {
    return (
      <>
        <Banner
          title={bannerParams.danger.title}
          message={bannerParams.danger.message}
          bannerIcon={BannerIcon.riskLevel}
          className="debt-limit-reached"
        />
      </>
    );
  } else {
    return (
      <>
        <Banner
          title={bannerParams.warning.title}
          message={bannerParams.warning.message}
          bannerIcon={BannerIcon.warningLevel}
          className="warning-debt-limit-reache"
        />
      </>
    );
  }
};

const selectBanner = (vaultData: any, userVaultData: any, globalStateData: any) => {
  const { totalDebt: totalVaultDebt, debtCeiling: vaultDebtCeiling } = vaultData;
  const { debt: userDebt, debtLimit: userDebtLimit } = userVaultData;
  const {
    totalDebt: globalDebt,
    debtCeiling: globalDebtCeiling,
    tvl: globalTvl,
    tvlLimit: globalTvlLimit,
  } = globalStateData;

  const vaultUSDrDebtPercentage = new BigNumber(totalVaultDebt.toString())
    .multipliedBy(100)
    .dividedBy(vaultDebtCeiling.toString())
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
  } else if (parseFloat(vaultUSDrDebtPercentage) >= 80) {
    return getTokenCapBanner('vaultUSDrDebt', parseFloat(vaultUSDrDebtPercentage));
  } else {
    return <></>;
  }
};

const TokenCapBanner = ({ mint }: any) => {
  const vaultData = useVaultInfo(mint);
  const userVaultData = useUserOverview()?.activeVaults[mint];
  const globalStateData = useRFStateInfo();

  return selectBanner(vaultData, userVaultData, globalStateData);
};

export default TokenCapBanner;

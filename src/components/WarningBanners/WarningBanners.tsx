import { useUserOverview, useVaultInfo, useRFStateInfo } from '../../contexts/state';
import { Banner, BannerIcon } from '../Banner';
import BigNumber from 'bignumber.js';

const WarningBanners = ({ mint }: any) => {
  const vaultData = useVaultInfo(mint);
  const userVaultData = useUserOverview()?.activeVaults[mint];
  const globalStateData = useRFStateInfo();

  console.log('GLOBAL STATE DATA');
  console.log(globalStateData);
  console.log(globalStateData.userDebtCeiling.toString());

  console.log(globalStateData.totalDebt.toString());
  console.log(globalStateData.debtCeiling.toString());

  return (
    <>
      {vaultData && new BigNumber(vaultData.totalDebt.toString()).gte(vaultData.debtCeiling.toString()) && (
        <Banner
          title="Vault Mintable USDr Limit Reached:"
          message="You cannot mint USDr"
          bannerIcon={BannerIcon.riskLevel}
          className="debt-limit-reached"
        />
      )}
      {userVaultData && userVaultData.debt >= userVaultData.debtLimit && (
        <Banner
          title="My Mintable USDr Limit Reached:"
          message="You cannot mint USDr"
          bannerIcon={BannerIcon.riskLevel}
          className="debt-limit-reached"
        />
      )}
      {globalStateData &&
        new BigNumber(globalStateData.totalDebt.toString()).gte(globalStateData.debtCeiling.toString()) && (
          <Banner
            title="Total Mintable USDr Limit Reached:"
            message="You cannot mint USDr"
            bannerIcon={BannerIcon.riskLevel}
            className="debt-limit-reached"
          />
        )}
    </>
  );
};

export default WarningBanners;

import { useVaultInfo } from '../../contexts/state';
import { Banner, BannerIcon } from '../Banner';
import BigNumber from 'bignumber.js';

const WarningBanners = ({ mint }: any) => {
  const vaultData = useVaultInfo(mint);

  return (
    <>
      {!new BigNumber(vaultData.totalDebt.toString()).isEqualTo(vaultData.debtCeiling.toString()) && (
        <Banner
          title="Vault Mintable USDr Limit Reached:"
          message="You cannot mint USDr"
          bannerIcon={BannerIcon.riskLevel}
          className="debt-limit-reached"
        />
      )}
    </>
  );
};

export default WarningBanners;

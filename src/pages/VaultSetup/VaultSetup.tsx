import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatUSD } from '../../utils/utils';
import linkIcon from '../../assets/images/link.svg';
import { selectors } from '../../features/dashboard';
import VaultHistoryCard from '../../components/VaultHistoryCard';
import VaultSetupContainer from '../../components/VaultSetupContainer';

const VaultSetup = () => {
  const allVaults = useSelector(selectors.getAllVaults);
  const [vaultData, setVaultData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { mint: vault_mint } = useParams<{ mint?: string }>();

  useEffect(() => {
    setIsLoading(true);
    const result: any = allVaults.find((item: any) => item.mint === vault_mint);
    if (result) {
      setVaultData(result);
      setIsLoading(false);
    }
  }, []);

  if (isLoading)
    return (
      <div className="col allvaults__loading">
        <div className="spinner-border text-info" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="vault-setup">
      <div>
        <h3 className="vault-setup-header">
          Open {vaultData.title === 'USDC-USDR' ? 'USDC-USDr' : vaultData.title} Vault
        </h3>
        <div className="mt-2 d-flex align-items-center">
          <p className="vault-setup-header-label mr-1">Platform:</p>
          {vaultData.platform && (
            <a href={vaultData.platform.link} target="_blank" rel="noreferrer" className="d-flex">
              <img src={vaultData.platform.icon} alt="platform" />
              <p className="vault-setup-header-value ml-1">{vaultData.platform.name}</p>
              <img src={linkIcon} alt="linkIcon" className="vault-setup-header-linkIcon" />
            </a>
          )}
          <p className="vault-setup-header-gap mx-3">|</p>
          <p className="vault-setup-header-label mr-1">APR:</p>
          <p className="vault-setup-header-value">{vaultData.apr}%</p>
          <p className="vault-setup-header-gap mx-3">|</p>
          <p className="vault-setup-header-label mr-1">TVL:</p>
          <p className="vault-setup-header-value">{formatUSD.format(vaultData.tvl)}</p>
        </div>
        <div className="row no-gutters">
          <div className="col-8">
            <div className="row no-gutters">
              <VaultHistoryCard />
              <VaultHistoryCard />
              <VaultHistoryCard />
              <VaultHistoryCard />
            </div>
          </div>
          <div className="col-4">{vaultData && <VaultSetupContainer data={vaultData} />}</div>
        </div>
      </div>
    </div>
  );
};

export default VaultSetup;

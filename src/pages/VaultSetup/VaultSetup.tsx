import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { formatUSD, getRiskLevelNumber } from '../../utils/utils';
import { TokenAmount } from '../../utils/safe-math';
import { USDR_MINT_KEY } from '../../utils/ratio-lending';

import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { useAccountByMint } from '../../contexts/accounts';
import { usePrice } from '../../contexts/price';
import { useRFStateInfo, useUSDrMintInfo, useVaultMintInfo } from '../../contexts/state';

import linkIcon from '../../assets/images/link.svg';
import { selectors } from '../../features/dashboard';
// import Breadcrumb from '../../components/Breadcrumb';
// import VaultHistoryCard from '../../components/VaultHistoryCard';
import VaultSetupContainer from '../../components/VaultSetupContainer';
import PriceCard from '../../components/Dashboard/PriceCard';
import WalletBalances from '../../components/Dashboard/AmountPanel/WalletBalances';

const priceCardData = [
  {
    title: 'Liquidation threshold',
    titleIcon: true,
    mainValue: '90.00',
    mainUnit: '(RAY/USD)',
    currentPrice: '$1.00 USD',
  },
];

const VaultSetup = () => {
  const { mint: vault_mint } = useParams<{ mint?: string }>();

  const connection = useConnection();
  const { wallet } = useWallet();
  const tokenPrice = usePrice(vault_mint as string);
  const collMint = useVaultMintInfo(vault_mint as string);
  const collAccount = useAccountByMint(vault_mint as string);
  const usdrMint = useUSDrMintInfo();
  const globalState = useRFStateInfo();
  const usdrAccount = useAccountByMint(USDR_MINT_KEY);

  const allVaults = useSelector(selectors.getAllVaults);
  const [vaultData, setVaultData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lpWalletBalance, setLpWalletBalance] = useState(0);
  const [lpWalletBalanceUSD, setLpWalletBalanceUSD] = useState(0);
  const [usdrWalletBalance, setUsdrWalletBalance] = useState(0);
  const [depositValue, setDepositValue] = useState(0);

  useEffect(() => {
    if (wallet && wallet.publicKey && collMint && collAccount) {
      const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
      setLpWalletBalance(Number(tokenAmount.fixed()));
    }
    return () => {
      setLpWalletBalance(0);
    };
  }, [wallet, collAccount, connection, collMint]);

  useEffect(() => {
    if (wallet && wallet.publicKey && usdrMint && usdrAccount) {
      const tokenAmount = new TokenAmount(usdrAccount.info.amount + '', usdrMint?.decimals);
      setUsdrWalletBalance(Number(tokenAmount.fixed()));
    }
    return () => {
      setUsdrWalletBalance(0);
    };
  }, [wallet, usdrAccount, connection, usdrMint]);

  useEffect(() => {
    if (tokenPrice && collMint && globalState) {
      //ternary operators are used here while the globalState paramters do not exist

      const tvlLimit = globalState?.tvlLimit ? globalState?.tvlLimit.toNumber() : 0;
      const tvl = globalState?.tvl ? globalState?.tvl.toNumber() : 0;
      const availableTVL = tvlLimit - tvl;
      //set the max amount of depositable LP to be equal to either the amount of lp the user holds, or the global limit
      const tmpMaxDeposit = Math.min(availableTVL, lpWalletBalance).toFixed(collMint?.decimals);
      setDepositValue(Number(tmpMaxDeposit));
      setLpWalletBalanceUSD(tokenPrice * lpWalletBalance);
    }
    return () => {
      // setDepositValue(0);
    };
  }, [lpWalletBalance, tokenPrice, collMint, globalState]);

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
        {/* <div className="pl-3">
          <Breadcrumb vaultData={vaultData} availableVaults={allVaults} />
        </div> */}
        <h3 className="vault-setup-header pl-3">
          Open {vaultData.title === 'USDC-USDR' ? 'USDC-USDr' : vaultData.title} Vault
        </h3>
        <div className="mt-2 d-flex align-items-center pl-3">
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
          <p className="vault-setup-header-value">{Number(vaultData?.apr).toFixed(2)}%</p>
          <p className="vault-setup-header-gap mx-3">|</p>
          <p className="vault-setup-header-label mr-1">TVL:</p>
          <p className="vault-setup-header-value">{formatUSD.format(vaultData.tvl)}</p>
        </div>
        <div className="row no-gutters">
          <div className="col-xxl-8 col-lg-6 col-md-12">
            <div className="row">
              <div className="col-xxl-6 col-lg-12 col-md-12">
                <PriceCard data={priceCardData[0]} tokenName={vaultData?.title} risk={vaultData?.risk} />
              </div>

              <div className="col-xxl-6 col-lg-12 col-md-12">
                <WalletBalances
                  mintAddress={vault_mint}
                  collAmount={lpWalletBalance}
                  collAmountUSD={lpWalletBalanceUSD}
                  icon={vaultData.icon}
                  icons={vaultData.icons}
                  tokenName={vaultData.title}
                  usdrAmount={usdrWalletBalance}
                />
              </div>
            </div>
          </div>
          <div className="col-xxl-4 col-lg-6 col-md-12 pt-3">
            {vaultData && (
              <VaultSetupContainer
                data={{
                  mint: vault_mint,
                  icon: vaultData.icon,
                  icons: vaultData.icons,
                  title: vaultData.title,
                  value: depositValue,
                  usdrMint: USDR_MINT_KEY,
                  riskLevel: getRiskLevelNumber(vault_mint),
                  risk: vaultData?.risk,
                  tokenPrice: tokenPrice,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultSetup;

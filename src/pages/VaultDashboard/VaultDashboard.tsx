import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import RiskLevel from '../../components/Dashboard/RiskLevel';
import VaultDebt from '../../components/Dashboard/VaultDebt';
import PriceCard from '../../components/Dashboard/PriceCard';
import ModalCard from '../../components/Dashboard/ModalCard';
import AmountPanel from '../../components/Dashboard/AmountPanel';
import WalletBalances from '../../components/Dashboard/AmountPanel/WalletBalances';

import share from '../../assets/images/share.svg';
import usdrIcon from '../../assets/images/USDr.png';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { USDR_MINT_KEY } from '../../utils/ratio-lending';
import { useAccountByMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { getRiskLevelNumber, calculateRemainingGlobalDebt, calculateRemainingUserDebt } from '../../utils/utils';
import { usePrice } from '../../contexts/price';
import { selectors } from '../../features/dashboard';

import Breadcrumb from '../../components/Breadcrumb';
// import { Banner, BannerIcon } from '../../components/Banner';
import { useRFStateInfo, useUSDrMintInfo, useUserInfo, useVaultMintInfo } from '../../contexts/state';
import { DEFAULT_NETWORK } from '../../constants';
import VaultHistoryTable from '../../components/Dashboard/VaultHistoryTable';
import { useFetchSaberLpPrice } from '../../hooks/useFetchSaberLpPrices';
import { FetchingStatus } from '../../types/fetching-types';
import { toast } from 'react-toastify';
import MintableProgressBar from '../../components/Dashboard/MintableProgressBar';
import WarningBanners from '../../components/WarningBanners';

const priceCardData = {
  mainUnit: '',
  currentPrice: '0',
};

const VaultDashboard = () => {
  const { mint: vault_mint } = useParams<{ mint: string }>();
  const connection = useConnection();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const usdrMint = useUSDrMintInfo();
  const collMint = useVaultMintInfo(vault_mint as string);

  const tokenPrice = usePrice(vault_mint as string);

  const collAccount = useAccountByMint(vault_mint as string);
  const usdrAccount = useAccountByMint(USDR_MINT_KEY);

  const userState = useUserInfo(vault_mint as string);
  const globalState = useRFStateInfo();
  const [vaultData, setVaultData] = useState<any>({});

  const [lpWalletBalance, setLpWalletBalance] = useState(0);
  const [lpWalletBalanceUSD, setLpWalletBalanceUSD] = useState(0);
  const [usdrWalletBalance, setUsdrWalletBalance] = useState(0);

  const [depositValue, setDepositValue] = useState(0);
  const [withdrawValue, setWithdrawValue] = useState(0);
  const [generateValue, setGenerateValue] = useState(0);
  const [debtValue, setDebtValue] = useState(0);
  const [activeVaults, setActiveVaults] = useState<any>();
  // eslint-disable-next-line
  const [hasReachedDebtLimit, setHasReachedDebtLimit] = useState(false);

  const allVaults = useSelector(selectors.getAllVaults);
  const overview = useSelector(selectors.getOverview);

  const [vaultDebtData, setVaultDebtData] = useState({
    mint: vault_mint,
    usdrMint: USDR_MINT_KEY,
    usdrValue: 0,
  });

  const solanaBeachUrl = useMemo(
    () => `https://solanabeach.io/address/${vault_mint}?cluster=${DEFAULT_NETWORK}`,
    [vault_mint]
  );
  const { error: errorPrice, status: statusPrice, lpPrice } = useFetchSaberLpPrice(vaultData?.platform?.symbol);

  useEffect(() => {
    const p = allVaults
      .map((item: any) => {
        if (overview && overview.activeVaults && Object.keys(overview.activeVaults).indexOf(item.mint) > -1) {
          return item;
        }
      })
      .filter(Boolean);
    console.log(p);
    setActiveVaults(p);
  }, [overview, allVaults]);

  useEffect(() => {
    if (statusPrice === FetchingStatus.Error && errorPrice) {
      toast.error(`There was an error when fetching the price: ${errorPrice?.message}`);
    }
  }, [statusPrice, errorPrice]);

  useEffect(() => {
    if (lpPrice) {
      priceCardData.mainUnit = lpPrice.poolName;
      priceCardData.currentPrice = lpPrice.lpPrice;
    } else {
      priceCardData.mainUnit = '';
      priceCardData.currentPrice = '0';
    }
  }, [lpPrice]);

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
      setDepositValue(0);
    };
  }, [lpWalletBalance, tokenPrice, collMint, globalState]);

  useEffect(() => {
    if (userState && tokenPrice && collMint && usdrMint && globalState && vaultData) {
      const remainingGlobalDebt = calculateRemainingGlobalDebt(globalState, usdrMint);
      const remainingUserDebt = calculateRemainingUserDebt(tokenPrice, vaultData?.risk, userState, collMint, usdrMint);
      const overalldebtLimit = Math.min(remainingGlobalDebt, remainingUserDebt);
      setHasReachedDebtLimit(overalldebtLimit <= 0 && +userState?.debt > 0);
      setGenerateValue(overalldebtLimit);
    }
    return () => {
      setHasReachedDebtLimit(false);
      setGenerateValue(0);
    };
  }, [tokenPrice, userState, globalState, usdrMint, collMint, vaultData]);

  useEffect(() => {
    if (userState && collMint) {
      const tmpWithdrawValue = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals).fixed();
      console.log('with value =', Number(tmpWithdrawValue));
      setWithdrawValue(Number(tmpWithdrawValue));
    }
    return () => {
      setWithdrawValue(0);
    };
  }, [userState, collMint]);

  useEffect(() => {
    if (userState && usdrMint) {
      const tmpDebtValue = new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed();
      setDebtValue(Number(tmpDebtValue));

      if (vault_mint) {
        setVaultDebtData({
          mint: vault_mint,
          usdrMint: USDR_MINT_KEY,
          usdrValue: Number(tmpDebtValue),
        });
      }
    }

    return () => {
      setVaultDebtData({
        mint: vault_mint,
        usdrMint: USDR_MINT_KEY,
        usdrValue: 0,
      });
    };
  }, [userState, vault_mint, usdrMint]);

  useEffect(() => {
    setIsLoading(true);
    const result: any = allVaults.find((item: any) => item.mint === vault_mint);
    if (result) {
      setVaultData(result);
    }
    setIsLoading(false);
  }, [allVaults, vault_mint]);

  const isMobile = useMediaQuery({ maxWidth: 1024 });
  // const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  // const isDefault = useMediaQuery({ minWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  if (isLoading)
    return (
      <div className="col allvaults__loading">
        <div className="spinner-border text-info" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  return (
    <>
      <WarningBanners mint={vaultData.mint} />
      <div className="vaultdashboard">
        <div className="vaultdashboard__header">
          <div className="vaultdashboard__header_titleBox row no-gutters">
            <div className="col-12">
              {activeVaults && <Breadcrumb vaultData={vaultData} availableVaults={activeVaults} />}
            </div>
            <div className="col-md-12 col-sm-12">
              <div>
                <h3>{vaultData.title === 'USDC-USDR' ? 'USDC-USDr' : vaultData.title} Vault</h3>
                {isMobile && (
                  <a href={solanaBeachUrl} rel="noreferrer" target="_blank">
                    View on Solana Beach
                    <img src={share} alt="share" />
                  </a>
                )}
              </div>
              <div className="row align-items-center no-md-gutters">
                <div className="col-lg-auto col-md-4 col-sm-12">
                  <RiskLevel level={vaultData.risk} />
                </div>
                <div className="col-lg-auto col-md-4 col-sm-12">
                  <MintableProgressBar />
                </div>
                {/* {isDefault && <div className="header__gap"></div>} */}
                <div className="col-lg-auto col-md-4 col-sm-12">
                  <VaultDebt data={vaultDebtData} />
                </div>
                <div className="col-lg-auto col-md-12 vaultdashboard__header_rightBox col-md-2 col-sm-12 ml-auto">
                  {isDesktop && (
                    <div className="text-right mb-4">
                      <img src={share} alt="share" />
                      <a href={solanaBeachUrl} rel="noopener noreferrer" target="_blank">
                        View on
                      </a>
                      <a href={solanaBeachUrl} rel="noopener noreferrer" target="_blank">
                        Solana Beach
                      </a>
                    </div>
                  )}
                  {/* <div className="vaultdashboard__header_speedometerBox">
            <SpeedoMetor risk={VaultData.risk} />
          </div> */}
                  {/*<div className="vaultdashboard__header_vaultdebtBox">*/}
                  {/*<VaultDebt data={vauldDebtData} />*/}
                  {/*</div>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="vaultdashboard__body row no-gutters">
          <div className="col-xxl-8">
            <div className="vaultdashboard__bodyleft row">
              <div className="col-lg-6">
                <PriceCard price={priceCardData} tokenName={vaultData?.title} risk={vaultData?.risk} />
              </div>
              <div className="col-lg-6">
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
              <div className="col-lg-6 col-md-12">
                <ModalCard
                  mintAddress={vault_mint}
                  title="Tokens in Vault"
                  icon={vaultData.icon}
                  icons={vaultData.icons}
                  tokenName={vaultData.title}
                  depositValue={depositValue}
                  withdrawValue={withdrawValue}
                  debtValue={debtValue}
                  type="deposit_withdraw"
                  riskLevel={getRiskLevelNumber(vault_mint)}
                />
              </div>
              <div className="col col-lg-6 col-sm-12">
                <ModalCard
                  mintAddress={vault_mint}
                  title="USDr Loan Amount"
                  icons={[usdrIcon]}
                  tokenName={vaultData.title}
                  debtValue={debtValue}
                  generateValue={generateValue}
                  type="borrow_payback"
                  riskLevel={getRiskLevelNumber(vault_mint)}
                />
              </div>
            </div>
            {/* {!isBigScreen && (
              <div className="col col-xxl-4 ">
                <div className="vaultdashboard__bodyright">
                  <AmountPanel
                    mintAddress={vault_mint}
                    collAmount={lpWalletBalance}
                    collAmountUSD={lpWalletBalanceUSD}
                    icon={vaultData.icon}
                    icons={vaultData.icons}
                    tokenName={vaultData.title}
                    usdrAmount={usdrWalletBalance}
                    platform={vaultData.platform}
                  />
                </div>
              </div>
            )} */}
            {
              <div className="vaultdashboard__bodyleft row pt-0 my-5">
                <div className="col">
                  <VaultHistoryTable mintAddress={vault_mint} />
                </div>
              </div>
            }
          </div>
          <div className="col col-xxl-4 ">
            <div className="vaultdashboard__bodyright">
              <AmountPanel
                mintAddress={vault_mint}
                collAmount={lpWalletBalance}
                collAmountUSD={lpWalletBalanceUSD}
                icon={vaultData.icon}
                icons={vaultData.icons}
                tokenName={vaultData.title}
                usdrAmount={usdrWalletBalance}
                platform={vaultData.platform}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VaultDashboard;

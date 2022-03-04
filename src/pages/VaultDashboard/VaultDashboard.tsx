import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useLocation } from 'react-router-dom';

import ComingSoon from '../../components/ComingSoon';
import RiskLevel from '../../components/Dashboard/RiskLevel';
import SpeedoMetor from '../../components/Dashboard/SpeedoMeter';
import VaultDebt from '../../components/Dashboard/VaultDebt';
import PriceCard from '../../components/Dashboard/PriceCard';
import ModalCard from '../../components/Dashboard/ModalCard';
import VaultHistoryTable from '../../components/Dashboard/VaultHistoryTable';
import AmountPanel from '../../components/Dashboard/AmountPanel';
import WalletBalances from '../../components/Dashboard/AmountPanel/WalletBalances';

import share from '../../assets/images/share.svg';
import usdrIcon from '../../assets/images/USDr.png';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { USDR_MINT_KEY } from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useAccountByMint, useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { getRiskLevelNumber, calculateRemainingGlobalDebt, calculateRemainingUserDebt } from '../../utils/utils';
import { getFaucetState } from '../../utils/ratio-faucet';
import { usePrice } from '../../contexts/price';
import { selectors } from '../../features/dashboard';
import { getRiskLevel } from '../../libs/helper';
import { getUSDrAmount, getLPAmount } from '../../utils/risk';

import Breadcrumb from '../../components/Breadcrumb';
import { Banner, BannerIcon } from '../../components/Banner';
import { useRFStateInfo, useUSDrMintInfo, useUserInfo, useVaultMintInfo } from '../../contexts/state';

const priceCardData = [
  {
    title: 'Liquidation threshold',
    titleIcon: true,
    mainValue: '90.00',
    mainUnit: '(RAY/USD)',
    currentPrice: '$1.00 USD',
  },
];

const VaultDashboard = () => {
  const history = useHistory();
  const { mint: vault_mint } = useParams<{ mint: string }>();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
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
  const [hasReachedDebtLimit, setHasReachedDebtLimit] = useState(false);

  const allVaults = useSelector(selectors.getAllVaults);
  const [vauldDebtData, setVaultDebtData] = useState({
    mint: vault_mint,
    usdrMint: USDR_MINT_KEY,
    usdrValue: 0,
  });

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

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDefault = useMediaQuery({ minWidth: 768 });

  const isBigScreen = useMediaQuery({ query: '(min-width: 1539px)' });

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
      {
        /* TODO: fix this */
        false && (
          <Banner
            title="USDr Debt Limit Reached:"
            message="You have reached your overall USDr Debt Limit"
            bannerIcon={BannerIcon.riskLevel}
            className="debt-limit-reached"
          />
        )
      }
      <div className="vaultdashboard">
        <div className="vaultdashboard__header">
          <div className="vaultdashboard__header_titleBox">
            <Breadcrumb vaultData={vaultData} availableVaults={allVaults} />
            <div className="d-flex">
              <div>
                <h3>{vaultData.title === 'USDC-USDR' ? 'USDC-USDr' : vaultData.title} Vault</h3>
                {isMobile && (
                  <Link to="/">
                    View on Solana Beach
                    <img src={share} alt="share" />
                  </Link>
                )}
                <RiskLevel level={vaultData.risk} />
              </div>
              <div>
                <VaultDebt data={vauldDebtData} />
              </div>
            </div>
          </div>

          {/* {isDefault && (
            <div className="text-right mt-4">
              <img src={share} alt="share" />
              <Link to="/">View on</Link>
              <Link to="/">Solana Beach</Link>
            </div>
          )} */}

          <div className="vaultdashboard__header_rightBox">
            {isDefault && (
              <div className="text-right mt-4">
                <img src={share} alt="share" />
                <Link to="/">View on</Link>
                <Link to="/">Solana Beach</Link>
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
        <div className="vaultdashboard__body row no-gutters">
          <div className="col-xxl-8">
            <div className="vaultdashboard__bodyleft row">
              <PriceCard data={priceCardData[0]} tokenName={vaultData?.title} risk={vaultData?.risk} />
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
            {/* <div className="vaultdashboard__bodyleft row pt-0 my-5">
              <div className="col">
                <VaultHistoryTable mintAddress={vault_mint} />
              </div>
            </div> */}
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

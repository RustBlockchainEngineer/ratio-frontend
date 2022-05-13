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
import { USDR_MINT_KEY, USDR_MINT_DECIMALS } from '../../utils/ratio-lending';
import { useAccountByMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { getRiskLevelNumber } from '../../utils/utils';
import { selectors } from '../../features/dashboard';

import Breadcrumb from '../../components/Breadcrumb';
import { useRFStateInfo, useUserVaultInfo, usePoolInfo } from '../../contexts/state';
import { DEFAULT_NETWORK } from '../../constants';
import VaultHistoryTable from '../../components/Dashboard/VaultHistoryTable';
import MintableProgressBar from '../../components/Dashboard/MintableProgressBar';
import TokenCapBanner from '../../components/TokenCapBanner';

const VaultDashboard = () => {
  const { mint: vault_mint } = useParams<{ mint: string }>();
  const connection = useConnection();
  const { wallet } = useWallet();

  const poolInfo = usePoolInfo(vault_mint as string);

  const collAccount = useAccountByMint(vault_mint as string);
  const usdrAccount = useAccountByMint(USDR_MINT_KEY);

  const userVaultInfo = useUserVaultInfo(vault_mint as string);
  const globalState = useRFStateInfo();
  const [vaultData, setVaultData] = useState<any>({});

  const [lpWalletBalance, setLpWalletBalance] = useState(0);
  const [lpWalletBalanceUSD, setLpWalletBalanceUSD] = useState(0);
  const [usdrWalletBalance, setUsdrWalletBalance] = useState(0);

  const [depositValue, setDepositValue] = useState(0);
  const [withdrawValue, setWithdrawValue] = useState(0);
  const generateValue = +new TokenAmount((userVaultInfo as any)?.mintableUSDr ?? 0, USDR_MINT_DECIMALS).fixed();
  const [debtValue, setDebtValue] = useState(0);

  const [activeVaults, setActiveVaults] = useState<any>();

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

  useEffect(() => {
    const p = allVaults.filter((item: any) => item.activeStatus);
    setActiveVaults(p);
  }, [overview, allVaults]);

  useEffect(() => {
    if (wallet && wallet.publicKey && poolInfo && collAccount) {
      const tokenAmount = new TokenAmount(collAccount.info.amount + '', poolInfo?.mintDecimals);
      setLpWalletBalance(Number(tokenAmount.fixed()));
    }
    return () => {
      setLpWalletBalance(0);
    };
  }, [wallet, collAccount, connection, poolInfo]);

  useEffect(() => {
    if (wallet && wallet.publicKey && usdrAccount) {
      const tokenAmount = new TokenAmount(usdrAccount.info.amount + '', USDR_MINT_DECIMALS);
      setUsdrWalletBalance(Number(tokenAmount.fixed()));
    }
    return () => {
      setUsdrWalletBalance(0);
    };
  }, [wallet, usdrAccount, connection]);

  useEffect(() => {
    if (poolInfo && globalState && globalState?.tvlCollatCeilingUsd) {
      //ternary operators are used here while the globalState paramters do not exist

      const globalTvlLimit = globalState?.tvlCollatCeilingUsd.toNumber();
      const tvl = globalState?.tvlUsd.toNumber();
      const availableCollat = (globalTvlLimit - tvl) / poolInfo.oraclePrice;
      //set the max amount of depositable LP to be equal to either the amount of lp the user holds, or the global limit
      const tmpMaxDeposit = Math.min(availableCollat, lpWalletBalance).toFixed(poolInfo?.mintDecimals);
      setDepositValue(Number(tmpMaxDeposit));

      setLpWalletBalanceUSD(poolInfo.currentPrice * lpWalletBalance);
    }
    return () => {
      setDepositValue(0);
    };
  }, [lpWalletBalance, poolInfo, globalState]);

  useEffect(() => {
    if (userVaultInfo && poolInfo) {
      const tmpWithdrawValue = new TokenAmount((userVaultInfo as any).totalColl, poolInfo?.mintDecimals).fixed();
      setWithdrawValue(Number(tmpWithdrawValue));
    }
    return () => {
      setWithdrawValue(0);
    };
  }, [userVaultInfo, poolInfo]);

  useEffect(() => {
    if (userVaultInfo) {
      const debtValue = +new TokenAmount((userVaultInfo as any).debt, USDR_MINT_DECIMALS).fixed();
      setDebtValue(debtValue);

      if (vault_mint) {
        setVaultDebtData({
          mint: vault_mint,
          usdrMint: USDR_MINT_KEY,
          usdrValue: debtValue,
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
  }, [userVaultInfo, vault_mint]);

  useEffect(() => {
    const result: any = allVaults.find((item: any) => item.mint === vault_mint);
    if (result) {
      setVaultData(result);
    }
  }, [allVaults, vault_mint]);

  const isMobile = useMediaQuery({ maxWidth: 1024 });
  // const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  // const isDefault = useMediaQuery({ minWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  return (
    <>
      <TokenCapBanner mint={vault_mint as string} />
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
                <PriceCard
                  price={{ currentPrice: poolInfo ? poolInfo.currentPrice : '0' }}
                  tokenName={vaultData?.title}
                  risk={poolInfo ? poolInfo.ratio : 0}
                />
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
                  price={poolInfo?.oraclePrice}
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
                  usdrWalletValue={usdrWalletBalance}
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

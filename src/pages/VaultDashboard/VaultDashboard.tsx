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
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';
import usdrIcon from '../../assets/images/USDr.png';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import {
  getUserState,
  getGlobalState,
  // USDR_MINT_KEY, TOKEN_VAULT_OPTIONS, getUsdrMintKey,
  getUpdatedUserState,
  USDR_MINT_KEY,
} from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useAccountByMint, useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { getRiskLevelNumber } from '../../utils/utils';
import { getFaucetState } from '../../utils/ratio-faucet';
import { usePrice } from '../../contexts/price';
import { selectors } from '../../features/dashboard';
import { getRiskLevel } from '../../libs/helper';
import { getUSDrAmount, getLPAmount } from '../../utils/risk';
import { useUpdateState } from '../../contexts/auth';
import Breadcrumb from '../../components/Breadcrumb';
import { Banner, BannerIcon } from '../../components/Banner';

const priceCardData = [
  {
    title: 'Liquidation threshold',
    titleIcon: true,
    mainValue: '$90.00 USD',
    mainUnit: '(RAY/USD)',
    currentPrice: '$300.00 USD',
  },
  // {
  //   title: 'Collateralization Ratio',
  //   titleIcon: false,
  //   mainValue: '295.85%',
  //   minimumRatio: '295.85%',
  //   stabilityFee: '4%',
  // },
];

const VaultDashboard = () => {
  const history = useHistory();
  const { mint: vault_mint } = useParams<{ mint: string }>();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const collMint = useMint(vault_mint as string);
  const usdrMint = useMint(USDR_MINT_KEY);
  const tokenPrice = usePrice(vault_mint as string);

  const collAccount = useAccountByMint(vault_mint as string);
  const usdrAccount = useAccountByMint(USDR_MINT_KEY);

  const [userState, setUserState] = useState<any>(null);
  const [globalState, setGlobalState] = useState<any>(null);

  const [VaultData, setVaultData] = useState<any>({});

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
    if (!connected) {
      history.push('/dashboard/all-vaults');
    } else if (vault_mint) {
      setIsLoading(true);
      getUserState(connection, wallet, new PublicKey(vault_mint)).then((res) => {
        if (res) {
          setIsLoading(false);
          setUserState(res);
        }
      });
    }

    return () => {
      setUserState(null);
    };
  }, [vault_mint, wallet, connected]);

  useEffect(() => {
    if (connected) {
      setIsLoading(true);
      getGlobalState(connection, wallet).then((res) => {
        if (res) {
          setIsLoading(false);
          setGlobalState(res);
        }
      });
    }

    return () => {
      setGlobalState(null);
    };
  }, [wallet, connected]);

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
    if (tokenPrice && collMint && lpWalletBalance && globalState && VaultData) {
      //ternary operators are used here while the globalState paramters do not exist
      const globalDebt = globalState?.totalDebt ? globalState?.totalDebt.toNumber() : 0;
      const globalDebtLimit = globalState?.debtCeiling ? globalState?.debtCeiling.toNumber() : 1000;
      const remainingGlobalDebt = globalDebtLimit - globalDebt;
      //we might want to chnage this and instead pull the risk rating from the contract once the featrue is ready
      const riskLevel = VaultData.risk ? VaultData.risk : 'AAA';
      //calculate the amount of LP of the current token that is needed to mint the remaining global debt
      const remainingGlobalDebtLP = getLPAmount(100, remainingGlobalDebt, riskLevel) / tokenPrice;
      //set the max amount of depositable LP to be equal to either the amount of lp the user holds, or the global limit
      const tmpMaxDeposit = Math.min(remainingGlobalDebtLP, lpWalletBalance).toFixed(collMint?.decimals);
      setDepositValue(Number(tmpMaxDeposit));
      setLpWalletBalanceUSD(tokenPrice * lpWalletBalance);
    }
    return () => {
      setDepositValue(0);
    };
  }, [lpWalletBalance, tokenPrice, collMint, globalState, VaultData]);

  useEffect(() => {
    if (userState && tokenPrice && collMint && usdrMint && globalState && VaultData) {
      //calculate reminaing usdr debt the user can mint based on their current deposited LP
      const debt = userState?.debt ?? 0;
      const lpLockedAmount = new TokenAmount(userState?.lockedCollBalance, collMint?.decimals);
      //we might want to chnage this and instead pull the risk rating from the contract once the featrue is ready
      const riskLevel = VaultData.risk ? VaultData.risk : 'AAA';
      const totalUSDr = getUSDrAmount(100, tokenPrice * Number(lpLockedAmount.fixed()), riskLevel);
      const maxAmount = totalUSDr - Number(new TokenAmount(debt, usdrMint?.decimals).fixed());
      const userDebtLimit = Number(maxAmount.toFixed(usdrMint?.decimals));
      //calculate remaining global debt
      const globalDebt = globalState?.totalDebt ? globalState?.totalDebt.toNumber() : 0;
      const globalDebtLimit = globalState?.debtCeiling ? globalState?.debtCeiling.toNumber() : 1000;
      const remainingGlobalDebt = globalDebtLimit - globalDebt;
      //compare the two debt limits and set the overall debt limit to be equal to the smaller value
      const overalldebtLimit = Math.min(remainingGlobalDebt, userDebtLimit);
      //this only captures wether the user debt limit has been hit
      setHasReachedDebtLimit(overalldebtLimit <= 0 && +debt > 0);
      setGenerateValue(overalldebtLimit);
    }
    return () => {
      setHasReachedDebtLimit(false);
      setGenerateValue(0);
    };
  }, [tokenPrice, userState, globalState, usdrMint, collMint, VaultData]);

  useEffect(() => {
    if (userState && collMint) {
      const tmpWithdrawValue = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals).fixed();
      console.log('locked', tmpWithdrawValue);
      setWithdrawValue(Number(tmpWithdrawValue));
    }
    return () => {
      setWithdrawValue(0);
    };
  }, [userState, collMint]);

  useEffect(() => {
    if (userState && usdrMint) {
      const tmpDebtValue = new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed();
      console.log('debt', tmpDebtValue);
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
      setIsLoading(false);
    }
  }, [allVaults, vault_mint]);

  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();
  useEffect(() => {
    if (updateStateFlag && wallet?.publicKey) {
      getUpdatedUserState(connection, wallet, vault_mint as string, userState).then((res) => {
        setUserState(res);
        setUpdateStateFlag(false);
      });
    }
  }, [updateStateFlag]);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDefault = useMediaQuery({ minWidth: 768 });

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
            <Breadcrumb VaultData={VaultData} availableVaults={allVaults} />
            <div className="d-flex">
              <div>
                <h3>{VaultData.title === 'USDC-USDR' ? 'USDC-USDr' : VaultData.title} Vault</h3>
                {isMobile && (
                  <Link to="/">
                    View on Solana Beach
                    <img src={share} alt="share" />
                  </Link>
                )}
                <RiskLevel level={VaultData.risk} />
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
              <PriceCard data={priceCardData[0]} tokenName={VaultData.title} />
              <div className="col-lg-6">
                <WalletBalances
                  mintAddress={vault_mint}
                  collAmount={lpWalletBalance}
                  collAmountUSD={lpWalletBalanceUSD}
                  icon={VaultData.icon}
                  icons={VaultData.icons}
                  tokenName={VaultData.title}
                  usdrAmount={usdrWalletBalance}
                />
              </div>
              <div className="col-lg-6 col-md-12">
                <ModalCard
                  mintAddress={vault_mint}
                  title="Tokens in Vault"
                  icon={VaultData.icon}
                  icons={VaultData.icons}
                  tokenName={VaultData.title}
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
                  tokenName={VaultData.title}
                  debtValue={debtValue}
                  generateValue={generateValue}
                  type="borrow_payback"
                  riskLevel={getRiskLevelNumber(vault_mint)}
                />
              </div>
            </div>
            <div className="vaultdashboard__bodyleft row pt-0 mt-5">
              <div className="col">
                <VaultHistoryTable mintAddress={vault_mint} />
              </div>
            </div>
          </div>
          <div className="col col-xxl-4 ">
            <div className="vaultdashboard__bodyright">
              <AmountPanel
                mintAddress={vault_mint}
                collAmount={lpWalletBalance}
                collAmountUSD={lpWalletBalanceUSD}
                icon={VaultData.icon}
                icons={VaultData.icons}
                tokenName={VaultData.title}
                usdrAmount={usdrWalletBalance}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VaultDashboard;

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useLocation } from 'react-router-dom';

import { MINTADDRESS } from '../../constants';

import ComingSoon from '../../components/ComingSoon';
import RiskLevel from '../../components/Dashboard/RiskLevel';
import SpeedoMetor from '../../components/Dashboard/SpeedoMeter';
import VaultDebt from '../../components/Dashboard/VaultDebt';
import PriceCard from '../../components/Dashboard/PriceCard';
import ModalCard from '../../components/Dashboard/ModalCard';
import VaultHistoryTable from '../../components/Dashboard/VaultHistoryTable';
import AmountPanel from '../../components/Dashboard/AmountPanel';

import share from '../../assets/images/share.svg';
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';
import usdrIcon from '../../assets/images/USDr.png';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import {
  getUserState,
  // USDR_MINT_KEY, TOKEN_VAULT_OPTIONS, getUsdrMintKey,
  getUpdatedUserState,
} from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useAccountByMint, useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { usePrice } from '../../contexts/price';
import { selectors } from '../../features/dashboard';
import { getRiskLevel } from '../../libs/helper';
import { getUSDrAmount } from '../../utils/risk';
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
  const usdrMint = useMint(MINTADDRESS['USDR']);
  const tokenPrice = usePrice(vault_mint as string);

  const collAccount = useAccountByMint(vault_mint as string);
  const usdrAccount = useAccountByMint(MINTADDRESS['USDR']);

  const [userState, setUserState] = useState(null);
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
    usdrMint: MINTADDRESS['USDR'],
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
    if (tokenPrice && collMint) {
      const initLPAmount = Number(process.env.REACT_APP_LP_AMOUNT_IN_USD) / tokenPrice;
      const tmpMaxDeposit = Math.min(initLPAmount, lpWalletBalance).toFixed(collMint?.decimals);
      console.log('deposit', tmpMaxDeposit);
      setDepositValue(Number(tmpMaxDeposit));

      setLpWalletBalanceUSD(tokenPrice * lpWalletBalance);
    }
    return () => {
      setDepositValue(0);
    };
  }, [lpWalletBalance, tokenPrice, collMint]);

  useEffect(() => {
    if (userState && tokenPrice && collMint && usdrMint) {
      const debt = (userState as any)?.debt ?? 0;
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals);
      const totalUSDr = getUSDrAmount(100, tokenPrice * Number(lpLockedAmount.fixed()), getRiskLevelNumber());
      const maxAmount = totalUSDr - Number(new TokenAmount(debt, usdrMint?.decimals).fixed());

      const debtLimit = Number(maxAmount.toFixed(usdrMint?.decimals));

      // TODO: we should change how we evaluate the debt limit, we have a task for this here https://ratiofinance.atlassian.net/jira/software/c/projects/RFM/boards/1?modal=detail&selectedIssue=RFM-671&quickFilter=1
      setHasReachedDebtLimit(debtLimit <= 0 && +debt > 0);
      setGenerateValue(debtLimit);
    }
    return () => {
      setHasReachedDebtLimit(false);
      setGenerateValue(0);
    };
  }, [tokenPrice, userState, usdrMint, collMint]);

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
          usdrMint: MINTADDRESS['USDR'],
          usdrValue: Number(tmpDebtValue),
        });
      }
    }

    return () => {
      setVaultDebtData({
        mint: vault_mint,
        usdrMint: MINTADDRESS['USDR'],
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

  const getRiskLevelNumber = () => {
    switch (vault_mint) {
      case MINTADDRESS['USDC-USDR']:
        return 0;
        break;
      case MINTADDRESS['ETH-SOL']:
        return 1;
        break;
      case MINTADDRESS['ATLAS-RAY']:
        return 2;
        break;
      case MINTADDRESS['SAMO-RAY']:
        return 3;
        break;

      default:
        break;
    }
    return 10;
  };

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
                <RiskLevel level={getRiskLevel(VaultData.risk)} />
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
        <div className="vaultdashboard__body row gutters">
          <div className="col col-md-8">
            <div className="vaultdashboard__bodyleft row">
              {/* {priceCardData.map((item, index) => {
              return (
                <div key={item.title} className="col col-md-12 col-sm-12">
                  <ComingSoon enable={index === 1}>
                    <PriceCard data={{ currentPrice: '$' + tokenPrice.toFixed(2) }} comingsoon={false} />
                  </ComingSoon>
                </div>
              );
            })} */}
              <div className="col col-lg-6 col-sm-12">
                <ModalCard
                  mintAddress={vault_mint}
                  title="Tokens in Vault"
                  icons={VaultData.icons}
                  tokenName={VaultData.title}
                  depositValue={depositValue}
                  withdrawValue={withdrawValue}
                  debtValue={debtValue}
                  type="deposit_withdraw"
                  riskLevel={getRiskLevelNumber()}
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
                  riskLevel={getRiskLevelNumber()}
                />
              </div>
            </div>
            <div className="vaultdashboard__bodyleft row pt-0 mt-5">
              <VaultHistoryTable />
            </div>
          </div>
          <div className="col col-md-4 ">
            <div className="vaultdashboard__bodyright">
              <AmountPanel
                mintAddress={vault_mint}
                collAmount={lpWalletBalance}
                collAmountUSD={lpWalletBalanceUSD}
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

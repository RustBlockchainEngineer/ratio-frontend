import React, { useEffect, useState } from 'react';
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
import { getFaucetState } from '../../utils/ratio-faucet';
import { usePrice } from '../../contexts/price';
import { selectors } from '../../features/dashboard';
import { getRiskLevel } from '../../libs/helper';
import { getUSDrAmount } from '../../utils/risk';
import { useUpdateState } from '../../contexts/auth';

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
  const { mint: vault_mint } = useParams<{ mint?: string }>();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const collMint = useMint(vault_mint as string);
  const usdrMint = useMint(MINTADDRESS['USDR']);
  const tokenPrice = usePrice(vault_mint as string);

  const collAccount = useAccountByMint(vault_mint as string);

  const [userState, setUserState] = useState(null);
  const [VaultData, setVaultData] = useState<any>({});

  const [depositValue, setDepositValue] = useState('0');
  const [withdrawValue, setWithdrawValue] = useState('0');
  const [generateValue, setGenerateValue] = useState('0');
  const [debtValue, setDebtValue] = useState('0');

  const availableVaults = useSelector(selectors.getAvailableVaults);
  const [vauldDebtData, setVaultDebtData] = useState({
    mint: vault_mint,
    usdrMint: MINTADDRESS['USDR'],
    usdrValue: 0,
  });
  const [lpWalletBalance, setLpWalletBalance] = useState(0);

  useEffect(() => {
    if (!connected) {
      history.push('/dashboard');
    } else if (vault_mint) {
      setIsLoading(true);
      getUserState(connection, wallet, new PublicKey(vault_mint)).then((res) => {
        if (res) {
          // let tv: string = new TokenAmount((res as any).lockedCollBalance, collMint ? collMint.decimals : 9).fixed();
          // tv = '' + Math.ceil(parseFloat(tv) * 100) / 100;
          // setWithdrawValue(tv);
          // console.log('asdasd', tv);
          setIsLoading(false);
          setUserState(res);
        }
      });
    }

    return () => {
      setUserState(null);
    };
  }, [vault_mint, wallet]);

  useEffect(() => {
    if (wallet && wallet.publicKey && collMint && collAccount) {
      const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
      setLpWalletBalance(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
    }
    return () => {
      setLpWalletBalance(0);
    };
  }, [wallet, collAccount, connection, collMint]);

  useEffect(() => {
    if (tokenPrice) {
      const initLPAmount = Math.ceil((Number(process.env.REACT_APP_LP_AMOUNT_IN_USD) / tokenPrice) * 1000) / 1000;
      const tmpMaxDeposit = '' + Math.min(initLPAmount, lpWalletBalance);
      console.log('deposit', tmpMaxDeposit);
      setDepositValue(tmpMaxDeposit);
    }
    return () => {
      setDepositValue('0');
    };
  }, [lpWalletBalance, tokenPrice]);

  useEffect(() => {
    if (userState && tokenPrice && collMint && usdrMint) {
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals);
      const totalUSDr = getUSDrAmount(100, tokenPrice * Number(lpLockedAmount.fixed()), getRiskLevelNumber());
      const maxAmount = totalUSDr - Number(new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed());
      console.log('generate', maxAmount);

      setGenerateValue('' + Math.ceil(Math.max(maxAmount, 0) * 1000) / 1000);
    }
    return () => {
      setGenerateValue('0');
    };
  }, [tokenPrice, userState, usdrMint, collMint]);

  useEffect(() => {
    if (userState && vault_mint && connected) {
      const tmpWithdrawValue = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals).fixed();
      setWithdrawValue(parseFloat(tmpWithdrawValue).toFixed(2));
      console.log('locked', tmpWithdrawValue);

      const tmpDebtValue = new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed();
      setDebtValue(parseFloat(tmpDebtValue).toFixed(2));
      console.log('debt', tmpDebtValue);

      setVaultDebtData({
        mint: vault_mint,
        usdrMint: MINTADDRESS['USDR'],
        usdrValue: Number(tmpDebtValue),
      });
    }
    if (!connected) {
      history.push(`/dashboard/available-vaults`);
    }
    return () => {
      setVaultDebtData({
        mint: vault_mint,
        usdrMint: MINTADDRESS['USDR'],
        usdrValue: 0,
      });
    };
  }, [userState, connected, vault_mint, collMint, usdrMint]);

  useEffect(() => {
    setIsLoading(true);
    const result: any = availableVaults.find((item: any) => item.mint === vault_mint);
    if (result) {
      setVaultData(result);
      setIsLoading(false);
    }
  }, []);

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
      <div className="col availablevaults__loading">
        <div className="spinner-border text-info" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="vaultdashboard">
      <div className="vaultdashboard__header">
        <div className="vaultdashboard__header_titleBox">
          <div>
            <h3>{VaultData.title} Vault</h3>
            {isMobile && (
              <Link to="/">
                View on Solana Beach
                <img src={share} alt="share" />
              </Link>
            )}
            <RiskLevel level={getRiskLevel(VaultData.risk)} />
          </div>
          {/* {isDefault && (
            <div className="text-right mt-4">
              <img src={share} alt="share" />
              <Link to="/">View on</Link>
              <Link to="/">Solana Beach</Link>
            </div>
          )} */}
        </div>
        <div className="vaultdashboard__header_rightBox">
          {/* <div className="vaultdashboard__header_speedometerBox">
            <SpeedoMetor risk={VaultData.risk} />
          </div> */}
          <div className="vaultdashboard__header_vaultdebtBox">
            <VaultDebt data={vauldDebtData} />
          </div>
        </div>
      </div>
      <div className="vaultdashboard__body row">
        <div className="col col-md-8">
          <div className="vaultdashboard__bodyleft row">
            {priceCardData.map((item, index) => {
              return (
                <div key={item.title} className="col col-md-12 col-sm-12">
                  <ComingSoon enable={index === 1}>
                    <PriceCard data={{ currentPrice: '$' + tokenPrice.toFixed(2) }} comingsoon={false} />
                  </ComingSoon>
                </div>
              );
            })}
            <div className="col col-lg-6 col-sm-12">
              <ModalCard
                mintAddress={vault_mint}
                title="Tokens Locked"
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
                title="Outstanding USDr Debt"
                icons={[usdrIcon]}
                tokenName={VaultData.title}
                debtValue={debtValue}
                generateValue={generateValue}
                type="borrow_payback"
                riskLevel={getRiskLevelNumber()}
              />
            </div>
          </div>
          {/* <div className="vaultdashboard__bodyleft row pt-0">
            <VaultHistoryTable />
          </div> */}
        </div>
        <div className="col col-md-4 vaultdashboard__bodyright">
          <AmountPanel vault_mint={vault_mint} />
        </div>
      </div>
    </div>
  );
};

export default VaultDashboard;

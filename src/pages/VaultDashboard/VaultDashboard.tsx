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
import { getUserState, USDR_MINT_KEY, TOKEN_VAULT_OPTIONS, getUsdrMintKey } from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { getFaucetState } from '../../utils/ratio-faucet';
import { usePrice } from '../../contexts/price';
import { selectors } from '../../features/dashboard';
import { getRiskLevel } from '../../libs/helper';

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

const defaultModalCardData = [
  {
    title: 'Tokens Locked',
    mint: '??',
    tokens: [rayIcon, solIcon],
    tokenNames: 'USDC-USDr LP',
    tokenValue: '0',
    type: 'deposit',
    withdrawValue: '0 USDC-USDr LP',
    riskLevel: 0,
    usdrMint: '??',
  },
  {
    title: 'Outstanding USDr Debt',
    mint: '??',
    tokens: [usdrIcon],
    tokenNames: 'USDr',
    tokenValue: '0',
    type: 'payback',
    GenerateValue: '0 USDr',
    usdrMint: '??',
  },
];

const VaultDashboard = () => {
  const history = useHistory();
  const { mint: vault_mint } = useParams<{ mint?: string }>();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const collMint = useMint(vault_mint as string);
  const tokenPrice = usePrice(vault_mint as string);

  const [userState, setUserState] = useState(null);
  const [VaultData, setVaultData] = useState<any>({});
  const [lpTokenValue, setLPTokenValue] = useState('0');
  const availableVaults = useSelector(selectors.getAvailableVaults);
  const [vauldDebtData, setVaultDebtData] = useState({
    mint: vault_mint,
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: 0,
  });

  useEffect(() => {
    if (!connected) {
      history.push('/dashboard');
    } else if (vault_mint) {
      setIsLoading(true);
      getUserState(connection, wallet, new PublicKey(vault_mint)).then((res) => {
        if (res) {
          let tv: string = new TokenAmount((res as any).lockedCollBalance, collMint ? collMint.decimals : 9).fixed();
          tv = '' + Math.ceil(parseFloat(tv) * 100) / 100;
          setLPTokenValue(tv);
          setIsLoading(false);
        }
      });
    }
  }, [connected, vault_mint, wallet]);

  useEffect(() => {
    setIsLoading(true);
    const result: any = availableVaults.find((item: any) => item.mint === vault_mint);
    if (result) {
      setVaultData(result);
      setIsLoading(false);
    }
  }, []);

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
                    <PriceCard data={item} comingsoon={index === 0} />
                  </ComingSoon>
                </div>
              );
            })}
            <div className="col col-lg-6 col-sm-12">
              <ModalCard
                // data={item}
                mintAddress={vault_mint}
                title="Tokens Locked"
                icons={VaultData.icons}
                tokenName={VaultData.title}
                tokenValue={lpTokenValue}
                type="deposit"
                riskLevel={getRiskLevelNumber()}
              />
            </div>
            <div className="col col-lg-6 col-sm-12">
              <ModalCard
                // data={item}
                mintAddress={vault_mint}
                title="Outstanding USDr Debt"
                icons={[usdrIcon]}
                tokenName={VaultData.title}
                tokenValue={'0'}
                type="payback"
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

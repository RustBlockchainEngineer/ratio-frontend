import React, { useEffect, useState } from 'react';
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

import share from '../../assets/images/share.svg';
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';
import usdrIcon from '../../assets/images/USDr.png';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { getUserState, USDR_MINT_KEY } from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { useGetRaydiumPools } from '../../contexts/pools';
import { cloneDeep, values } from 'lodash';
import BN from 'bn.js';
import { getPriceWithTokenAddress } from '../../utils/prices';

const priceCardData = [
  {
    title: 'Liquidation threshold',
    titleIcon: true,
    mainValue: '$90.00 USD',
    mainUnit: '(RAY/USD)',
    currentPrice: '$300.00 USD',
  },
  {
    title: 'Collateralization Ratio',
    titleIcon: false,
    mainValue: '295.85%',
    minimumRatio: '295.85%',
    stabilityFee: '4%',
  },
];

const VaultDashboard = () => {
  const history = useHistory();
  const search = useLocation().search;
  // const vault_mint = new URLSearchParams(search).get('mint');
  const { mint: vault_mint } = useParams<{ mint?: string }>();

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const usdrMint = useMint(USDR_MINT_KEY);
  const collMint = useMint(vault_mint as string);
  const rayPools = useGetRaydiumPools();

  const [coin, setCoin] = useState(null);
  const [coinPrice, setCoinPrice] = useState(0);

  const [pc, setPc] = useState(null);
  const [pcPrice, setPcPrice] = useState(0);

  const [lpSupply, setLpSupply] = useState(0);
  const [lpTokenPrice, setLpTokenPrice] = useState(0);

  const [userState, setUserState] = useState(null);
  const [riskLevel, setRiskLevel] = useState(0.0);

  const [modalCardData, setModalCardData] = useState([
    {
      title: 'Tokens Locked',
      mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
      tokens: [rayIcon, solIcon],
      tokenNames: 'USDC-USDr-LP',
      tokenValue: '0',
      type: 'deposit',
      withdrawValue: '0 USDC-USDr-LP',
    },
    {
      title: 'Outstanding USDr Debt',
      mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
      tokens: [usdrIcon],
      tokenNames: 'USDr',
      tokenValue: '0',
      type: 'payback',
      GenerateValue: '0 USDr',
    },
  ]);

  useEffect(() => {
    if (vault_mint && wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(vault_mint)).then((res) => {
        setUserState(res);
      });
    }
  }, [vault_mint, wallet]);

  useEffect(() => {
    if (rayPools) {
      const poolInfo = rayPools['HwzkXyX8B45LsaHXwY8su92NoRBS5GQC32HzjQRDqPnr'];
      setCoin((poolInfo as any).coin);
      setPc((poolInfo as any).pc);
      setLpSupply(Number((poolInfo as any).lp.totalSupply.fixed()));
    }
  }, [rayPools, vault_mint]);

  useEffect(() => {
    if (coin) {
      getPriceWithTokenAddress((coin as any).mintAddress).then((price: number) => {
        setCoinPrice(price);
      });
    }
  }, [coin]);

  useEffect(() => {
    if (pc) {
      getPriceWithTokenAddress((pc as any).mintAddress).then((price: number) => {
        setPcPrice(price);
      });
    }
  }, [pc]);

  useEffect(() => {
    if (coin && pc && lpSupply) {
      const price =
        (coinPrice * Number((coin as any).balance.fixed()) + pcPrice * Number((pc as any).balance.fixed())) / lpSupply;
      setLpTokenPrice(price);
    }
  }, [coin, coinPrice, pc, pcPrice, lpSupply]);

  useEffect(() => {
    if (userState && vault_mint) {
      const newData = [...modalCardData];
      newData[0].tokenValue = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals).fixed();
      newData[0].tokenValue = '' + Math.ceil(parseFloat(newData[0].tokenValue) * 100) / 100;
      newData[0].mint = vault_mint;

      newData[1].tokenValue = new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed();
      newData[1].tokenValue = '' + Math.ceil(parseFloat(newData[1].tokenValue) * 100) / 100;
      newData[1].mint = vault_mint;

      const lpTokenVolume = lpTokenPrice * Number(newData[0].tokenValue);
      let maxUSDr = 0;
      if (riskLevel < 8) {
        maxUSDr = lpTokenVolume * 95.238095238;
      } else if (riskLevel < 12) {
        maxUSDr = lpTokenVolume * 69;
      } else if (riskLevel < 25) {
        maxUSDr = lpTokenVolume * 50;
      } else {
        maxUSDr = lpTokenVolume * 40;
      }
      newData[1].GenerateValue = Math.ceil(maxUSDr) / 100 + ' USDr';
      console.log(newData[0].tokenValue, lpTokenPrice, newData[1].GenerateValue);
      console.log(newData[0].tokenValue);
      setModalCardData(newData);
    }
  }, [userState, wallet, usdrMint, lpTokenPrice]);

  useEffect(() => {
    if (!connected) {
      history.push('/dashboard');
    }
  }, [connected]);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDefault = useMediaQuery({ minWidth: 768 });
  return (
    <div className="vaultdashboard">
      <div className="vaultdashboard__header">
        <div className="vaultdashboard__header_titleBox">
          <div>
            <h3>RAY-SOL-LP Vault #2024</h3>
            {isMobile && (
              <Link to="/">
                View on Solana Beach
                <img src={share} alt="share" />
              </Link>
            )}
            <RiskLevel level="HIGH" />
          </div>
          {isDefault && (
            <div className="text-right mt-4">
              <img src={share} alt="share" />
              <Link to="/">View on</Link>
              <Link to="/">Solana Beach</Link>
            </div>
          )}
        </div>
        <div className="vaultdashboard__header_rightBox">
          <div className="vaultdashboard__header_speedometerBox">
            <SpeedoMetor />
          </div>
          <div className="vaultdashboard__header_vaultdebtBox">
            <VaultDebt />
          </div>
        </div>
      </div>
      <div className="vaultdashboard__body row">
        <div className="col col-md-8">
          <div className="vaultdashboard__bodyleft row">
            {priceCardData.map((item, index) => {
              return (
                <div className="col col-md-6 col-sm-12">
                  <ComingSoon enable={index === 1}>
                    <PriceCard key={item.title} data={item} comingsoon={index === 0} />
                  </ComingSoon>
                </div>
              );
            })}
            {modalCardData.map((item) => {
              return (
                <div className="col col-md-6 col-sm-12">
                  <ModalCard key={item.title} data={item} />
                </div>
              );
            })}
          </div>
          <div className="vaultdashboard__bodyleft row pt-0">
            <VaultHistoryTable />
          </div>
        </div>
        <div className="col col-md-4 vaultdashboard__bodyright">
          <AmountPanel vault_mint={vault_mint} />
        </div>
      </div>
    </div>
  );
};

export default VaultDashboard;

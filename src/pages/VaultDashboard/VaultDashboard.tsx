import React from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
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

const priceCardData = [
  {
    title: 'Liquidation Price',
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

const modalCardData = [
  {
    title: 'Tokens Locked',
    mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
    tokens: [rayIcon, solIcon],
    tokenNames: 'USDC-USDr-LP',
    tokenValue: '20.36',
    type: 'deposit',
    withdrawValue: '0.1USDC-USDr-LP',
  },
  {
    title: 'Outstanding USDr Debt',
    mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
    tokens: [usdrIcon],
    tokenNames: 'USDr',
    tokenValue: '52.28',
    type: 'payback',
    GenerateValue: '32.28USDr',
  },
];

const VaultDashboard = () => {
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
            {priceCardData.map((item) => {
              return (
                <div className="col col-md-6 col-sm-12">
                  <PriceCard key={item.title} data={item} />
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
          <AmountPanel />
        </div>
      </div>
    </div>
  );
};

export default VaultDashboard;

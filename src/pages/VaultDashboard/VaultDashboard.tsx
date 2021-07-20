import React from 'react'
import { Link } from 'react-router-dom'
import RiskLevel from '../../components/Dashboard/RiskLevel'
import SpeedoMetor from '../../components/Dashboard/SpeedoMeter'
import VaultDebt from '../../components/Dashboard/VaultDebt'
import PriceCard from '../../components/Dashboard/PriceCard'
import ModalCard from '../../components/Dashboard/ModalCard'
import VaultHistoryTable from '../../components/Dashboard/VaultHistoryTable'
import AmountPanel from '../../components/Dashboard/AmountPanel'

import share from '../../assets/images/share.svg'
import rayIcon from '../../assets/images/RAY.svg'
import solIcon from '../../assets/images/SOL.svg'
import usdrIcon from '../../assets/images/USDr.svg'

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
]

const modalCardData = [
  {
    title: 'TokensLocked',
    tokens: [rayIcon, solIcon],
    tokenNames: 'RAY-SOL-LP',
    tokenValue: '20.36',
    type: 'deposit',
    withdrawValue: '0.1RAY-SOL-LP',
  },
  {
    title: 'Outstanding USDr Debt',
    tokens: [usdrIcon],
    tokenNames: 'USDr',
    tokenValue: '52.28',
    type: 'payback',
    GenerateValue: '32.28USDr',
  },
]

const VaultDashboard = () => {
  return (
    <div className="vaultdashboard">
      <div className="vaultdashboard__header row">
        <div className="col col-8 vaultdashboard__header_titleBox">
          <div>
            <h3>RAY-SOL-LP Vault #2024</h3>
            <RiskLevel level="HIGH" />
          </div>
          <div className="text-right mt-4">
            <img src={share} alt="share" />
            <Link to="/">View on</Link>
            <Link to="/">Solana Beach</Link>
          </div>
        </div>
        <div className="col col-2 vaultdashboard__header_speedometerBox">
          <SpeedoMetor />
        </div>
        <div className="col col-2 vaultdashboard__header_vaultdebtBox">
          <VaultDebt />
        </div>
      </div>
      <div className="vaultdashboard__body row">
        <div className="col col-8">
          <div className="vaultdashboard__bodyleft row">
            {priceCardData.map((item) => {
              return (
                <div className="col col-6">
                  <PriceCard key={item.title} data={item} />
                </div>
              )
            })}
            {modalCardData.map((item) => {
              return (
                <div className="col col-6">
                  <ModalCard key={item.title} data={item} />
                </div>
              )
            })}
          </div>
          <div className="vaultdashboard__bodyleft row pt-0">
            <VaultHistoryTable />
          </div>
        </div>
        <div className="col col-4 vaultdashboard__bodyright">
          <AmountPanel />
        </div>
      </div>
    </div>
  )
}

export default VaultDashboard

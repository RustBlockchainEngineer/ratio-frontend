import React from 'react'

import ActivePairCard from '../../components/ActivePairCard'
import FilterPanel from '../../components/FilterPanel'
import stepIcon from '../../assets/images/STEP.svg'
import usdcIcon from '../../assets/images/USDC.svg'
import rayIcon from '../../assets/images/RAY.svg'
import solIcon from '../../assets/images/SOL.svg'

const tokenPairs = [
  {
    id: 0,
    icons: [stepIcon, usdcIcon],
    title: 'STEP-USDC',
    tvl: '$70,458,607.97',
    risk: 'HIGH',
    apr: 125,
    owed: '$1,200',
    mint: '$600',
    price: '$3,000',
  },
  {
    id: 1,
    icons: [rayIcon, solIcon],
    title: 'RAY-SOL',
    tvl: '$57,537,364.18',
    risk: 'MEDIUM',
    apr: 125,
    owed: '$1,200',
    mint: '$600',
    price: '$3,000',
    warning: true,
  },
]

const ActiveVaults = () => {
  const [viewType, setViewType] = React.useState('tile')

  const onViewType = (type: string) => {
    setViewType(type)
  }

  return (
    <div className="activeVaults">
      <FilterPanel
        label="Available Vaults"
        viewType={viewType}
        onViewType={onViewType}
      />
      <div className="row ">
        {tokenPairs.map((item) => {
          return <ActivePairCard data={item} key={item.id} />
        })}
      </div>
    </div>
  )
}

export default ActiveVaults

import React, { useState } from 'react'

import FilterPanel from '../../components/FilterPanel'
import TokenPairCard from '../../components/TokenPairCard'
import stepIcon from '../../assets/images/STEP.svg'
import usdcIcon from '../../assets/images/USDC.svg'

const tokenPairs = [
  {
    id: 0,
    icons: [stepIcon, usdcIcon],
    title: 'STEP-USDC',
    tvl: '$70,458,607.97',
    risk: 12.5,
    apr: 125,
    details:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  },
]

const AvailableVaults = () => {
  const [viewType, setViewType] = useState('tile')

  const onViewType = (type: string) => {
    setViewType(type)
  }

  return (
    <div className="availablevaults">
      <FilterPanel
        label="Available Vaults"
        viewType={viewType}
        onViewType={onViewType}
      />
      <div className="row mt-3">
        {tokenPairs.map((item) => {
          return <TokenPairCard data={item} key={item.id} />
        })}
      </div>
    </div>
  )
}

export default AvailableVaults

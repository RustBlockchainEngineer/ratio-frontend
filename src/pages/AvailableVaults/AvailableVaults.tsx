import React, { useState } from 'react'

import FilterPanel from '../../components/FilterPanel'
import TokenPairCard from '../../components/TokenPairCard'
import stepIcon from '../../assets/images/STEP.svg'
import usdcIcon from '../../assets/images/USDC.svg'
import rayIcon from '../../assets/images/RAY.svg'
import solIcon from '../../assets/images/SOL.svg'
import ethIcon from '../../assets/images/ETH.svg'
import srmIcon from '../../assets/images/SRM.svg'
import mediaIcon from '../../assets/images/MEDIA.svg'

const tokenPairs = [
  {
    id: 0,
    icons: [stepIcon, usdcIcon],
    title: 'STEP-USDC',
    tvl: '$70,458,607.97',
    risk: 'HIGH',
    apr: 125,
    details:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  },
  {
    id: 1,
    icons: [rayIcon, solIcon],
    title: 'RAY-SOL',
    tvl: '$57,537,364.18',
    risk: 'MEDIUM',
    apr: 125,
    details:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  },
  {
    id: 2,
    icons: [rayIcon, ethIcon],
    title: 'RAY-ETH',
    tvl: '$38,954,120.69',
    risk: 'LOW',
    apr: 125,
    details:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  },
  {
    id: 3,
    icons: [rayIcon, srmIcon],
    title: 'RAY-SRM',
    tvl: '$36,886,437.47',
    risk: 'LOW',
    apr: 125,
    details:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  },
  {
    id: 4,
    icons: [rayIcon, usdcIcon],
    title: 'RAY-USDC',
    tvl: '$34,697,467.58',
    risk: 'MEDIUM',
    apr: 125,
    details:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  },
  {
    id: 5,
    icons: [mediaIcon, usdcIcon],
    title: 'MEDIA-USDC',
    tvl: '$20,818,044.40',
    risk: 'LOW',
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
      <div className="row">
        {tokenPairs.map((item) => {
          return <TokenPairCard data={item} key={item.id} />
        })}
      </div>
    </div>
  )
}

export default AvailableVaults

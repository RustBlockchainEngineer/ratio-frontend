import React from 'react'

import ArchivedPairCard from '../../components/ArchivedPairCard'
import FilterPanel from '../../components/FilterPanel'

import rayIcon from '../../assets/images/RAY.svg'
import solIcon from '../../assets/images/SOL.svg'

const tokenPairs = [
  {
    id: 1,
    icons: [rayIcon, solIcon],
    title: 'RAY-SOL',
    tvl: '$57,537,364.18',
    risk: 'MEDIUM',
    apr: 125,
    owed: '$1,200',
    mint: '$0',
    price: '$3,000',
  },
]

const ArchivedVaults = () => {
  const [viewType, setViewType] = React.useState('tile')

  const onViewType = (type: string) => {
    setViewType(type)
  }
  return (
    <div className="archivedVaults">
      <FilterPanel
        label="My Archived Vaults"
        viewType={viewType}
        onViewType={onViewType}
      />
      <div className="row ">
        {tokenPairs.map((item) => {
          return <ArchivedPairCard data={item} key={item.id} />
        })}
      </div>
    </div>
  )
}

export default ArchivedVaults

import React, { useState } from 'react'

import FilterPanel from '../../components/FilterPanel'

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
    </div>
  )
}

export default AvailableVaults

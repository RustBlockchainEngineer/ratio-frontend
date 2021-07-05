import React from 'react'
import classNames from 'classnames'
import Select from 'react-select'
import { IoSearchOutline } from 'react-icons/io5'
import title from '../../assets/images/tile.svg'
import list from '../../assets/images/list.svg'

interface FilterPanelProps {
  label: string
  onViewType: (type: string) => void
  viewType: string
}

const options = [
  { value: 'APR', label: 'APR' },
  { value: 'RISK', label: 'RISK' },
  { value: 'TVL', label: 'TVL' },
]

const FilterPanel = ({ label, onViewType, viewType }: FilterPanelProps) => {
  return (
    <div className="filterpanel">
      <h2>{label}</h2>
      <div className="d-flex justify-content-between">
        <div className="form-group has-search">
          <IoSearchOutline className="form-control-feedback" size={25} />
          <input
            type="text"
            className="form-control"
            placeholder="Search all vaults"
          />
        </div>
        <div className="d-flex align-items-center">
          <p className="mr-2 filterpanel__sortby">Sort by: </p>
          <Select
            options={options}
            classNamePrefix="react-select"
            defaultValue={{ label: 'APR', value: 'APR' }}
          />
          <img
            src={title}
            alt="tile"
            onClick={() => onViewType('tile')}
            className={classNames([
              'ml-4 filterpanel__viewtype',
              { 'filterpanel__viewtype-active': viewType === 'tile' },
            ])}
            aria-hidden="true"
          />
          <img
            src={list}
            alt="list"
            onClick={() => onViewType('list')}
            className={classNames([
              'filterpanel__viewtype',
              { 'filterpanel__viewtype-active': viewType === 'list' },
            ])}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}

export default FilterPanel

import React from 'react'
import { useMediaQuery } from 'react-responsive'
import classNames from 'classnames'
import Select from 'react-select'
import { IoSearchOutline } from 'react-icons/io5'
import title from '../../assets/images/tile.svg'
import list from '../../assets/images/list.svg'

type FilterPanelProps = {
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
  const isDefault = useMediaQuery({ minWidth: 768 })
  const isMobile = useMediaQuery({ maxWidth: 767 })
  return (
    <div className="filterpanel">
      <h2>{label}</h2>
      <div className="d-flex justify-content-between">
        <div>
          {isMobile && <p className="mr-2 filterpanel__sortby">Search: </p>}
          <div className="form-group has-search">
            <IoSearchOutline className="form-control-feedback" size={25} />
            <input
              type="text"
              className="form-control"
              placeholder="Search all vaults"
            />
          </div>
        </div>
        <div className="d-md-flex align-items-center">
          <p className="mr-2 filterpanel__sortby">Sort by: </p>
          <Select
            options={options}
            classNamePrefix="react-select"
            defaultValue={{ label: 'APR', value: 'APR' }}
          />
          {isDefault && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterPanel

import React from 'react'
import { IoWarningOutline } from 'react-icons/io5'
import { useMediaQuery } from 'react-responsive'
import classNames from 'classnames'
import BootstrapTable from 'react-bootstrap-table-next'
import Button from '../../components/Button'
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
    risk: 'LIQUIDATED',
    apr: 125,
    owed: '$1,200',
    mint: '$0',
    price: '$3,000',
    warning: true,
  },
]

const columns = [
  {
    dataField: 'id',
    text: 'Asset',
    headerStyle: {
      width: '20%',
    },
    formatter: (cell: any, row: any) => {
      return (
        <div className="align-items-center">
          <div className="d-flex ">
            <div>
              <img src={row.icons[0]} alt={row.icons[0].toString()} />
              <img
                src={row.icons[1]}
                alt={row.icons[1].toString()}
                className="archivedpaircard__header-icon"
              />
            </div>
            <div
              className={classNames('archivedpaircard__titleBox', {
                'archivedparcard__titleBox--warning': row.warning,
              })}
            >
              <h6>{row.title}</h6>
              <p>TVL: {row.tvl}</p>
            </div>
          </div>
          {row.warning && (
            <div className="archivedpaircard__warningBox">
              <div>
                <IoWarningOutline size={27} />
              </div>
              <p className="pt-1">
                <strong>LIQUIDATED:</strong> The price of your assets reach the
                liquidation price of <strong>$90</strong> meaning you have now
                been liquidated.
              </p>
            </div>
          )}
        </div>
      )
    },
    style: {
      paddingTop: 35,
    },
  },
  {
    dataField: 'apr',
    text: 'APR',
    headerStyle: {
      width: '7%',
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.apr}%</h6>
    },
    style: {
      paddingTop: 35,
    },
  },
  {
    dataField: 'owed',
    text: 'USDr Owed',
    headerStyle: {
      width: '10%',
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.owed}</h6>
    },
    style: {
      paddingTop: 35,
    },
  },
  {
    dataField: 'mint',
    text: 'Available to Mint',
    headerStyle: {
      width: '12%',
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="danger semiBold">{row.mint}</h6>
    },
    style: {
      paddingTop: 35,
    },
  },
  {
    dataField: 'price',
    text: 'Liquidation Price',
    headerStyle: {
      width: '12%',
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="semiBold">{row.price}</h6>
    },
    style: {
      paddingTop: 35,
    },
  },
  {
    dataField: 'risk',
    text: 'Risk Level',
    headerStyle: {
      width: '9%',
    },
    formatter: (cell: any, row: any) => {
      return <h6 className="danger semiBold">{row.risk}</h6>
    },
    style: {
      paddingTop: 35,
    },
  },
  {
    dataField: '',
    text: '',
    formatter: (cell: any, row: any) => {
      return (
        <div
          className={classNames('archivedpaircard__btnBox d-flex', {
            'archivedpaircard__btnBox--warning': row.warning,
          })}
        >
          <div className="col">
            <Button className="button--danger lp-button">
              View Liquidated Vault
            </Button>
          </div>
        </div>
      )
    },
  },
]
const rowClasses = (row: any) => {
  let classes = ''
  if (row.warning) {
    classes = 'warning_position'
  }
  return classes
}

const ArchivedVaults = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const [viewType, setViewType] = React.useState('tile')

  React.useEffect(() => {
    if (isMobile) {
      setViewType('tile')
    }
  }, [isMobile])

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
        {viewType === 'tile' &&
          tokenPairs.map((item) => {
            return <ArchivedPairCard data={item} key={item.id} />
          })}
        {viewType === 'list' && (
          <div className="mt-4 archivedVaults__list">
            <BootstrapTable
              bootstrap4
              keyField="id"
              data={tokenPairs}
              columns={columns}
              bordered={false}
              rowClasses={rowClasses}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ArchivedVaults

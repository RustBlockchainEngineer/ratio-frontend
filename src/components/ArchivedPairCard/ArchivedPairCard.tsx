import React from 'react'
import { IoWarningOutline } from 'react-icons/io5'
import classNames from 'classnames'
import Button from '../Button'

type PairType = {
  id: number
  icons: Array<string>
  title: string
  tvl: string
  risk: string
  apr: number
  owed: string
  mint: string
  price: string
}

interface ArchivedCardProps {
  data: PairType
}

const ArchivedPairCard = ({ data }: ArchivedCardProps) => {
  //   const [isOpen, setOpen] = React.useState(false)
  //   const connectedWallet = useSelector(selectors.getConnectedStatus)

  return (
    <>
      <div className="col col-xl-4 col-lg-6 col-md-12">
        <div className={classNames('archivedpaircard mt-4')}>
          <div className="archivedpaircard__header">
            <div className="d-flex">
              <div>
                <img src={data.icons[0]} alt={data.icons[0].toString()} />
                <img
                  src={data.icons[1]}
                  alt={data.icons[1].toString()}
                  className="archivedpaircard__header-icon"
                />
              </div>
              <div className={classNames('archivedpaircard__titleBox')}>
                <h6>{data.title}</h6>
                <p>{data.tvl}</p>
              </div>
            </div>
            <div className="archivedpaircard__riskBox">
              <div className="d-flex justify-content-end align-items-center mt-1">
                <h6>{data.risk}</h6>
              </div>
            </div>
          </div>
          <div className="archivedpaircard__aprBox">
            <div className="d-flex justify-content-between">
              <h6>APR:</h6>
              <h6 className="semiBold">{data.apr}%</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Owed:</h6>
              <h6 className="semiBold">{data.owed}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Available to Mint:</h6>
              <h6 className="semiBold danger">{data.mint}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>Liquidation Price:</h6>
              <h6 className="semiBold">{data.price}</h6>
            </div>
          </div>
          <div className="archivedpaircard__btnBox d-flex">
            <div className="col">
              <Button className="button--danger lp-button">
                View Liquidated Vault
              </Button>
            </div>
          </div>
          <div className="archivedpaircard__warningBox">
            <div>
              <IoWarningOutline size={27} />
            </div>
            <p>
              <strong>LIQUIDATED:</strong> The price of your assets reach the
              liquidation price of <strong>$90</strong> meaning you have now
              been liquidated.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ArchivedPairCard

import React from 'react'
import { IoWarningOutline } from 'react-icons/io5'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import classNames from 'classnames'
import Button from '../Button'
import riskLevel from '../../assets/images/risklevel.svg'
import highRisk from '../../assets/images/highrisk.svg'

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
  warning?: boolean
}

interface ActiveCardProps {
  data: PairType
}

const ActivePairCard = ({ data }: ActiveCardProps) => {
  //   const [isOpen, setOpen] = React.useState(false)
  //   const connectedWallet = useSelector(selectors.getConnectedStatus)

  return (
    <>
      <div className="col col-xl-4 col-lg-6 col-md-12">
        <div
          className={classNames('activepaircard mt-4', {
            'activepaircard--warning': data.warning,
          })}
        >
          <div className="activepaircard__header">
            <div className="d-flex">
              <div>
                <img src={data.icons[0]} alt={data.icons[0].toString()} />
                <img
                  src={data.icons[1]}
                  alt={data.icons[1].toString()}
                  className="activepaircard__header-icon"
                />
              </div>
              <div
                className={classNames('activepaircard__titleBox', {
                  'activepaircard__titleBox--warning': data.warning,
                })}
              >
                <h6>{data.title}</h6>
                <p>{data.tvl}</p>
              </div>
            </div>
            <div className="activepaircard__riskBox">
              <div className="d-flex">
                <p>Risk Level:</p>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip id="risk-tooltip">
                      The risk is a financial formula comprised of the weight,
                      standard deviations and covariances of the underlying
                      assets in the LP pair.
                    </Tooltip>
                  }
                >
                  <img src={riskLevel} alt="lisklevel" className="ml-2" />
                </OverlayTrigger>
              </div>
              <div className="d-flex justify-content-end align-items-center mt-1">
                {data.risk === 'HIGH' && <img src={highRisk} alt="highRisk" />}
                <h6
                  className={classNames(
                    'text-right ml-1',
                    data.risk.toLocaleLowerCase()
                  )}
                >
                  {data.risk}
                </h6>
              </div>
            </div>
          </div>
          <div className="activepaircard__aprBox">
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
              <h6 className="semiBold">{data.mint}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>Liquidation Price:</h6>
              <h6 className="semiBold">{data.price}</h6>
            </div>
          </div>
          <div className="activepaircard__btnBox d-flex">
            <div className="col">
              <Button className="button--gradientBorder lp-button">
                Deposit LP
              </Button>
            </div>
            <div className="col">
              <Button className="button--fill lp-button">Enter Vault</Button>
            </div>
          </div>
          {data.warning && (
            <div className="activepaircard__warningBox">
              <div>
                <IoWarningOutline size={27} />
              </div>
              <p>
                <strong>WARNING:</strong> You are approaching your liquidation
                threshold of <strong>$90.</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ActivePairCard

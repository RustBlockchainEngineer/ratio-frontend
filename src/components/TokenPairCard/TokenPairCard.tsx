import React from 'react'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Button from '../Button'

import riskLevel from '../../assets/images/risklevel.svg'
import highRisk from '../../assets/images/highrisk.svg'

type PairType = {
  id: number
  icons: Array<string>
  title: string
  tvl: string
  risk: number
  apr: number
  details: string
}

interface TokenPairCardProps {
  data: PairType
}

const TokenPairCard = ({ data }: TokenPairCardProps) => {
  const [isOpen, setOpen] = React.useState(false)

  return (
    <div className="col col-4">
      <div className="tokenpaircard">
        <div className="tokenpaircard__header">
          <div className="d-flex">
            <div>
              <img
                src={data.icons[0]}
                alt={data.icons[0].toString()}
                className=""
              />
              <img
                src={data.icons[1]}
                alt={data.icons[1].toString()}
                className="tokenpaircard__header-icon"
              />
            </div>
            <div className="tokenpaircard__titleBox">
              <h6>{data.title}</h6>
              <p>{data.tvl}</p>
            </div>
          </div>
          <div className="tokenpaircard__riskBox">
            <div className="d-flex">
              <p>Risk Level:</p>
              <OverlayTrigger
                placement="top"
                delay={{ show: 250, hide: 400 }}
                overlay={
                  <Tooltip id="risk-tooltip">
                    The risk is a financial formula comprised of the weight,
                    standard deviations and covariances of the underlying assets
                    in the LP pair.
                  </Tooltip>
                }
              >
                <img src={riskLevel} alt="lisklevel" className="ml-2" />
              </OverlayTrigger>
            </div>
            <div className="d-flex justify-content-end align-items-center mt-1">
              <img src={highRisk} alt="highRisk" />
              <h6 className="text-right ml-1 high">High</h6>
            </div>
          </div>
        </div>
        <div className="tokenpaircard__aprBox">
          <h6>APR:</h6>
          <h6 className="semiBold">{data.apr}%</h6>
        </div>
        <div className="tokenpaircard__btnBox d-flex">
          <div className="col">
            <Button className="button--gradientBorder insta-buy-lp">
              Insta-buy Lp
            </Button>
          </div>
          <div className="col">
            <OverlayTrigger
              placement="top"
              trigger="click"
              delay={{ show: 250, hide: 400 }}
              overlay={
                <Tooltip id="tooltip">
                  Connect your wallet to unlock this.
                </Tooltip>
              }
            >
              <div>
                <Button className="button--disabled generate">
                  Generate USDr
                </Button>
              </div>
            </OverlayTrigger>
          </div>
        </div>
        <div className="tokenpaircard__detailBox">
          {isOpen && (
            <div className="tokenpaircard__detailBox__content">
              {data.details}
            </div>
          )}

          <div
            className="tokenpaircard__detailBox__toggle"
            onClick={() => setOpen(!isOpen)}
            aria-hidden="true"
          >
            More details {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenPairCard

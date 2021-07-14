import React from 'react'

import risklevel from '../../../assets/images/risklevel.svg'

interface PricecardInterface {
  title: string
  titleIcon: boolean
  mainValue: string
  mainUnit?: string
  currentPrice?: string
  minimumRatio?: string
  stabilityFee?: string
}

type PriceCardProps = {
  data: PricecardInterface
}

const PriceCard = ({ data }: PriceCardProps) => {
  return (
    <div className="pricecard">
      <div className="pricecard__header">
        <div className="pricecard__title">
          <p>{data.title}</p>
          {data.titleIcon && <img src={risklevel} alt="risklevel" />}
        </div>
        <div className="pricecard__value">
          <h3>{data.mainValue}</h3>
          {data.mainUnit && <p>{data.mainUnit}</p>}
        </div>
      </div>
      <div className="pricecard__body">
        {data.currentPrice && (
          <div>
            <label>Current Price Information</label>
            <p>{data.currentPrice}</p>
          </div>
        )}
        {data.minimumRatio && (
          <div className="d-flex justify-content-between">
            <div>
              <label>Minimum Ratio</label>
              <p>{data.minimumRatio}</p>
            </div>
            <div>
              <label>Stability Fee</label>
              <p>{data.stabilityFee}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PriceCard

import React from 'react';
import ComingSoon from '../../ComingSoon';
import risklevel from '../../../assets/images/risklevel.svg';

interface PricecardInterface {
  title?: string;
  titleIcon?: boolean;
  mainValue?: string;
  mainUnit?: string;
  currentPrice?: string;
  minimumRatio?: string;
  stabilityFee?: string;
}

type PriceCardProps = {
  data: PricecardInterface;
  comingsoon?: boolean;
};

const PriceCard = ({ data, comingsoon }: PriceCardProps) => {
  return (
    <div className="pricecard">
      {/* <div className="pricecard__header">
        <div className="pricecard__title">
          <p>{data.title}</p>
          {data.titleIcon && <img src={risklevel} alt="risklevel" />}
        </div>
        <div className="pricecard__value">
          <h3>{data.mainValue}</h3>
          {data.mainUnit && <p>{data.mainUnit}</p>}
        </div>
      </div> */}
      <div className="pricecard__header">
        {data.currentPrice && (
          <div>
            <label>Current LP Token Price</label>
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
              <p className="text-right">{data.stabilityFee}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCard;

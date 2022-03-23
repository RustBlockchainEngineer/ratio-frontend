import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import smallRatioIcon from '../../../assets/images/smallRatio.svg';

const TotalRewards = () => {
  return (
    <div className="totalrewards">
      <div className="totalrewards__border"></div>
      <div className="totalrewards__content row">
        <div className="d-flex align-items-center col">
          <div className="totalrewards__ratioIcon">
            <img src={smallRatioIcon} alt="smallRatioIcon" />
          </div>
          <p className="totalrewards__label">Total Available Rewards:</p>
          <p className="totalrewards__value">3,000,000 RATIO</p>
        </div>
        <div className="col-lg-3 col-md-4 col-xs-12 d-flex align-items-center">
          <p className="totalrewards__completed">40% claimed</p>
          <ProgressBar now={40} />
        </div>
      </div>
      <div className="totalrewards__border"></div>
    </div>
  );
};

export default TotalRewards;

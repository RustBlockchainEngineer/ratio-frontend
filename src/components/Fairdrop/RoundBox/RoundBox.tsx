import classNames from 'classnames';
import React, { useState } from 'react';
// import { useCountdown } from '../../../hooks/useCountdown';
import decayfactorIcon from '../../../assets/images/decayfactor.svg';
import claimablerewardIcon from '../../../assets/images/claimablereward.svg';
import CountdownTimer from './CountDownTimer';

const RoundBox = () => {
  const THREE_DAYS_IN_MS = 5 * 24 * 60 * 60 * 1000;
  const NOW_IN_MS = new Date().getTime();
  const dateTimeAfterThreeDays = NOW_IN_MS + THREE_DAYS_IN_MS;

  const [isDanger, setIsDanger] = useState(false);

  return (
    <div className="roundbox">
      <div className={classNames('roundbox__top', { 'roundbox__top--danger': isDanger })}>
        <h5>Round 1 completes in...</h5>
        <CountdownTimer targetDate={dateTimeAfterThreeDays} setDanger={(danger: boolean) => setIsDanger(danger)} />
      </div>
      <div className="roundbox__bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6>
            <img src={decayfactorIcon} alt="decayfactorIcon" />
            Current Decay Factor
          </h6>
          <h5>0%</h5>
        </div>
        <div className="mt-2 d-flex justify-content-between align-items-center">
          <h6>
            <img src={claimablerewardIcon} alt="claimablerewardIcon" />
            Total Claimable Reward
          </h6>
          <h5>1,000</h5>
        </div>
      </div>
    </div>
  );
};

export default RoundBox;

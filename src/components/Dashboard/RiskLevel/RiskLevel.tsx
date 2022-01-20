import React from 'react';
import classNames from 'classnames';

import highRisk from '../../../assets/images/highrisk.svg';
import { ERiskLevel } from '../../../libs/helper';

type RiskLevelProps = {
  level: ERiskLevel;
};

const RiskLevel = ({ level }: RiskLevelProps) => {
  return (
    <div className={classNames('risklevel')}>
      <div className="risklevel__name">Risk Level:</div>
      <div className={classNames('d-flex align-items-center', 'risklevel__level', `risklevel-${level}`)}>
        {(level === ERiskLevel.EXTREME || level === ERiskLevel.HIGH) && (
          <img src={highRisk} alt="highriskIcon" className="highrisk" />
        )}
        <p>{level}</p>
      </div>
    </div>
  );
};

export default RiskLevel;

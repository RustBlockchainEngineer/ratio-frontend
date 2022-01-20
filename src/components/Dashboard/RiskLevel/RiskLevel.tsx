import React from 'react';
import classNames from 'classnames';

import highRisk from '../../../assets/images/highrisk.svg';
import smallRatio from '../../../assets/images/smallRatio.svg';

type RiskLevelProps = {
  level: string;
};

const RiskLevel = ({ level }: RiskLevelProps) => {
  return (
    <div className={classNames('risklevel')}>
      <div className="risklevel__name">
        <img src={smallRatio} alt="smallRatio" className="ratioicon" />
        Risk Rating
      </div>
      <div className={classNames('d-flex align-items-center', 'risklevel__level', `risklevel-${level}`)}>
        {level === 'DDD' && <img src={highRisk} alt="highlevel" />}
        <p>{level}</p>
      </div>
    </div>
  );
};

export default RiskLevel;

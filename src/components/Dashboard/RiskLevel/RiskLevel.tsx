import React from 'react';
import classNames from 'classnames';

import highRisk from '../../../assets/images/highrisk.svg';
import smallRatio from '../../../assets/images/smallRatio.svg';
import { ERiskLevel } from '../../../types/VaultTypes';

type RiskLevelProps = {
  level: ERiskLevel;
  isSinglePool?: boolean;
};

const RiskLevel = ({ level, isSinglePool }: RiskLevelProps) => {
  return (
    <div className={classNames('risklevel')}>
      <div className="risklevel__name !flex items-center">
        <img src={smallRatio} alt="smallRatio" className="ratioicon" />
        Risk Rating
      </div>
      <div className={classNames('d-flex align-items-center', 'risklevel__level', `risklevel-${level}`)}>
        {(level === ERiskLevel.EXTREME || level === ERiskLevel.HIGH) && (
          <img src={highRisk} alt="highriskIcon" className="highrisk" />
        )}
        {isSinglePool && <p>{level}</p>}
      </div>
    </div>
  );
};

export default RiskLevel;

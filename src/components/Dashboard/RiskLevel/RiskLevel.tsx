import React from 'react'
import classNames from 'classnames'

import riskLevel from '../../../assets/images/risklevel.svg'
import highRisk from '../../../assets/images/highrisk.svg'

type RiskLevelProps = {
  level: string
}

const RiskLevel = ({ level }: RiskLevelProps) => {
  return (
    <div className={classNames('risklevel')}>
      <div className="risklevel__name">
        Risk Level:
        <img src={riskLevel} alt="risklevel" />
      </div>
      <div
        className={classNames(
          'd-flex align-items-center',
          'risklevel__level',
          `risklevel-${level}`
        )}
      >
        {level === 'HIGH' && <img src={highRisk} alt="highlevel" />}
        <p>{level}</p>
      </div>
    </div>
  )
}

export default RiskLevel

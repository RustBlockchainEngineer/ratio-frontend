import React from 'react'
import GaugeChart from 'react-gauge-chart'

const SpeedoMeter = () => {
  return (
    <div className="speedometer">
      <p>Vault Health</p>
      <GaugeChart
        id="gauge-chart4"
        nrOfLevels={18}
        arcPadding={0.1}
        cornerRadius={4}
        percent={0.7}
        hideText
        textColor="#FF0000"
      />
      <div className="speedometer__labelBox">
        <p>Liquidation</p>
        <p>Surplus</p>
      </div>
    </div>
  )
}

export default SpeedoMeter

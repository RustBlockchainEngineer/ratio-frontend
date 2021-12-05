import React from 'react';
import GaugeChart from 'react-gauge-chart';

type SpeedoMeterProps = {
  risk: number;
};

const SpeedoMeter = ({ risk }: SpeedoMeterProps) => {
  const riskLevel = React.useMemo(() => risk / 250, [risk]);
  console.log(riskLevel);
  return (
    <div className="speedometer">
      <p>Vault Health</p>
      <GaugeChart
        id="gauge-chart4"
        nrOfLevels={18}
        arcPadding={0.1}
        cornerRadius={4}
        percent={riskLevel}
        hideText
        textColor="#FF0000"
        colors={['#FF3131', '#05B12C']}
      />
      <div className="speedometer__labelBox">
        <p>Liquidation</p>
        <p>Surplus</p>
      </div>
    </div>
  );
};

export default SpeedoMeter;

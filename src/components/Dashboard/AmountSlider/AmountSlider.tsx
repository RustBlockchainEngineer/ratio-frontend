import React from 'react';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

type AmountSliderProps = {
  onChangeValue: (value: any) => void;
  value: number;
};

const AmountSlider = ({ onChangeValue, value }: AmountSliderProps) => {
  const marks = {
    0: '0%',
    25: '25%',
    50: '50%',
    75: '75%',
    100: '100%',
  };

  return (
    <div className="amountSlider">
      <label>Or choose amount</label>
      <Slider min={0} marks={marks} step={1} onChange={onChangeValue} defaultValue={0} value={value} included={true} />
    </div>
  );
};

export default AmountSlider;

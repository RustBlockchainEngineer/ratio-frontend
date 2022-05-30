import React from 'react';

import Slider from 'rc-slider';
import raf from 'rc-util/lib/raf';
import Tooltip from 'rc-tooltip';
import type { SliderProps } from 'rc-slider';
//import 'rc-slider/assets/index.css';
//import 'rc-tooltip/assets/bootstrap.css';

type AmountSliderProps = {
  onChangeValue: (value: any) => void;
  value: number;
};

const HandleTooltip = (props: {
  value: number;
  children: React.ReactElement;
  visible: boolean;
  tipFormatter?: (value: number) => React.ReactNode;
}) => {
  const { value, children, visible, tipFormatter = (val) => `${val} %`, ...restProps } = props;

  const tooltipRef = React.useRef<any>();
  const rafRef = React.useRef<number | null>(null);

  function cancelKeepAlign() {
    raf.cancel(rafRef.current!);
  }

  function keepAlign() {
    rafRef.current = raf(() => {
      tooltipRef.current?.forcePopupAlign();
    });
  }

  React.useEffect(() => {
    if (visible) {
      keepAlign();
    } else {
      cancelKeepAlign();
    }

    return cancelKeepAlign;
  }, [value, visible]);

  return (
    <Tooltip
      placement="top"
      overlay={tipFormatter(value)}
      overlayInnerStyle={{ minHeight: 'auto' }}
      ref={tooltipRef}
      visible={visible}
      {...restProps}
    >
      {children}
    </Tooltip>
  );
};

// const handleRender: SliderProps['handleRender'] = (node, props) => {
//   return (
//     <HandleTooltip value={props.value} visible={props.dragging}>
//       {node}
//     </HandleTooltip>
//   );
// };

const TooltipSlider = ({
  tipFormatter,
  tipProps,
  ...props
}: SliderProps & { tipFormatter?: (value: number) => React.ReactNode; tipProps: any }) => {
  const tipHandleRender: SliderProps['handleRender'] = (node, handleProps) => {
    return (
      <HandleTooltip value={handleProps.value} visible={handleProps.dragging} tipFormatter={tipFormatter} {...tipProps}>
        {node}
      </HandleTooltip>
    );
  };

  return <Slider {...props} handleRender={tipHandleRender} />;
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
      <TooltipSlider
        min={0}
        marks={marks}
        step={1}
        onChange={onChangeValue}
        defaultValue={0}
        value={value}
        included={true}
        tipProps={undefined}
      />
    </div>
  );
};

export default AmountSlider;

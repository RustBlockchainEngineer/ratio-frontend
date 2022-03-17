import React from 'react';
import classNames from 'classnames';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { TokenAmount } from '../../utils/safe-math';
import { TVL_DECIMAL } from '../../constants/constants';
import { useRFStateInfo } from '../../contexts/state';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';

interface NavBarProgressBarTVLProps {
  className: string;
  shouldDisplayLabel?: boolean;
}

export const NavBarProgressBarTVL = (data: NavBarProgressBarTVLProps) => {
  const { className, shouldDisplayLabel = true } = data;

  const [currentValue, setValue] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  const [warning, setWarning] = React.useState(false);

  const globalState = useRFStateInfo();
  const connection = useConnection();
  const { wallet } = useWallet();

  React.useEffect(() => {
    if (!wallet || !wallet.publicKey || !globalState) {
      return;
    }

    // globalState.tvl ? globalState.tvl.toNumber() : 1;
    const currentValue = Number(new TokenAmount(globalState.tvl as string, TVL_DECIMAL).fixed());
    setValue(currentValue);

    // globalState.tvlLimit ? globalState.tvlLimit.toNumber() : 20;
    const maxValue = Number(new TokenAmount(globalState.tvlLimit as string, TVL_DECIMAL).fixed());

    if (maxValue === 0 || isNaN(maxValue)) {
      setPercentage(0);
      setWarning(false);
    } else {
      const percentageFull = ((currentValue / maxValue) * 100).toFixed(2);
      setPercentage(parseFloat(percentageFull));
      setWarning(currentValue / maxValue === 1);
    }
  }, [wallet, connection, globalState]);

  const label = shouldDisplayLabel ? ProgressBarLabelType.TVL : ProgressBarLabelType.None;

  return (
    <NavBarProgressBar
      className={classNames(
        className,
        { 'navbarprogressbar--warning': warning },
        { 'navbarprogressbar--tvl': !warning }
      )}
      label={label}
      shouldDisplayCurrency={true}
      currentValue={currentValue}
      percentage={percentage}
    />
  );
};

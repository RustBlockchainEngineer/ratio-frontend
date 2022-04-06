import { useState, useEffect } from 'react';
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

  const [currentValue, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [success, setSuccess] = useState(false);
  const [caution, setCaution] = useState(false);
  const [warning, setWarning] = useState(false);

  const globalState = useRFStateInfo();
  const connection = useConnection();
  const { wallet } = useWallet();

  useEffect(() => {
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
    } else {
      const percentageFull = (currentValue / maxValue) * 100;
      if (percentageFull >= 0 && percentageFull <= 80) {
        setSuccess(true);
        setCaution(false);
        setWarning(false);
      } else if (percentageFull > 80 && percentageFull < 100) {
        setSuccess(false);
        setCaution(true);
        setWarning(false);
      } else if (percentageFull >= 100) {
        setSuccess(false);
        setCaution(false);
        setWarning(true);
      }
      setPercentage(parseFloat(percentageFull.toFixed(2)));
    }
  }, [wallet, connection, globalState]);

  const label = shouldDisplayLabel ? ProgressBarLabelType.TVL : ProgressBarLabelType.None;

  return (
    <NavBarProgressBar
      className={classNames(
        className,
        { 'navbarprogressbar--warning': warning && !caution && !success },
        { 'navbarprogressbar--caution': caution && !warning && !success },
        { 'navbarprogressbar--success': success && !caution && !warning }
      )}
      label={label}
      shouldDisplayCurrency={true}
      currentValue={currentValue}
      percentage={percentage}
    />
  );
};

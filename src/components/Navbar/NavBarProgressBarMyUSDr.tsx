import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';
import { useRFStateInfo, useUserOverview } from '../../contexts/state';
import { TokenAmount } from '../../utils/safe-math';

interface NavBarProgressBarMyUSDrProps {
  className: string;
  shouldDisplayLabel?: boolean;
}

export const NavBarProgressBarMyUSDr = (data: NavBarProgressBarMyUSDrProps) => {
  const { className, shouldDisplayLabel = true } = data;

  const [currentValue, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [success, setSuccess] = useState(false);
  const [caution, setCaution] = useState(false);
  const [warning, setWarning] = useState(false);

  const userOverview = useUserOverview();
  const globalState = useRFStateInfo();

  const connection = useConnection();
  const { wallet } = useWallet();

  useEffect(() => {
    if (!wallet || !wallet.publicKey || !userOverview.activeVaults || !globalState) {
      return;
    }

    const activeVaults = Object.values(userOverview.activeVaults);
    const debt = activeVaults.reduce((acc: number, obj: any) => {
      return (acc + obj.debt) as number;
    }, 0);

    const currentValue = Number(new TokenAmount(debt, 6).fixed());

    // We get the user debt limit from the contract
    const maxValue = Number(new TokenAmount(globalState.userDebtCeiling as string, 6).fixed());

    // Current Value
    setValue(currentValue);

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
  }, [wallet, connection, userOverview, globalState]);

  const label = shouldDisplayLabel ? ProgressBarLabelType.USDr : ProgressBarLabelType.None;

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

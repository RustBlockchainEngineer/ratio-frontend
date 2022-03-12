import React from 'react';
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

  const [currentValue, setValue] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  const [warning, setWarning] = React.useState(false);

  const userOverview = useUserOverview();
  const globalState = useRFStateInfo();

  const connection = useConnection();
  const { wallet } = useWallet();

  React.useEffect(() => {
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
      setWarning(false);
    } else {
      const percentageFull = ((currentValue / maxValue) * 100).toFixed(2);
      setPercentage(parseFloat(percentageFull));
      setWarning(currentValue / maxValue === 1);
    }
  }, [wallet, connection, userOverview, globalState]);

  const label = shouldDisplayLabel ? ProgressBarLabelType.USDr : ProgressBarLabelType.None;

  return (
    <NavBarProgressBar
      className={classNames(
        className,
        { 'navbarprogressbar--warning': warning },
        { 'navbarprogressbar--usdr': !warning }
      )}
      label={label}
      shouldDisplayCurrency={true}
      currentValue={currentValue}
      percentage={percentage}
    />
  );
};

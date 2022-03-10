import React from 'react';
import classNames from 'classnames';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';
import { useUserOverview } from '../../contexts/state';
import { TokenAmount } from '../../utils/safe-math';

interface NavBarProgressBarUSDrProps {
  className: string;
  shouldDisplayLabel?: boolean;
}

export const NavBarProgressBarUSDr = (data: NavBarProgressBarUSDrProps) => {
  const { className, shouldDisplayLabel = true } = data;

  const [currentValue, setValue] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  const [warning, setWarning] = React.useState(false);

  const userOverview = useUserOverview();
  const connection = useConnection();
  const { wallet } = useWallet();

  React.useEffect(() => {
    if (!wallet || !wallet.publicKey || !userOverview.activeVaults) {
      return;
    }

    const activeVaults = Object.values(userOverview.activeVaults);
    const { debt, debtLimit } = activeVaults.reduce(
      (acc: { debt: number; debtLimit: number }, obj: any) => {
        return { debt: (acc.debt + obj.debt) as number, debtLimit: (acc.debtLimit + obj.debtLimit) as number };
      },
      { debt: 0, debtLimit: 0 }
    );

    // Current Value
    setValue(debt);

    const maxValue = debt + debtLimit;

    if (maxValue === 0 || isNaN(maxValue)) {
      setPercentage(0);
      setWarning(false);
    } else {
      const percentageFull = ((debt / maxValue) * 100).toFixed(2);
      setPercentage(parseFloat(percentageFull));
      setWarning(debt / maxValue === 1);
    }
  }, [wallet, connection, userOverview]);

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
      currentValue={+new TokenAmount(currentValue, 6).fixed()}
      percentage={percentage}
    />
  );
};

import React from 'react';
import classNames from 'classnames';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { getGlobalState } from '../../utils/ratio-lending';
import { TokenAmount } from '../../utils/safe-math';
import { useUserOverview } from '../../contexts/state';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';

interface NavBarProgressBarUSDrProps {
  className: string;
  shouldDisplayLabel?: boolean;
}

export const NavBarProgressBarUSDr = (data: NavBarProgressBarUSDrProps) => {
  const { className, shouldDisplayLabel = true } = data;

  const [currentValue, setValue] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  const [warning, setWarning] = React.useState(false);
  const [globalState, setGlobalState] = React.useState<any>(null);

  const userOverview = useUserOverview();
  const connection = useConnection();
  const { wallet } = useWallet();

  React.useEffect(() => {
    if (wallet && wallet.publicKey) {
      getGlobalState(connection, wallet).then((res) => {
        if (!res) {
          return;
        }
        setGlobalState(res?.globalState);
      });
    }
    return () => {
      setGlobalState(null);
    };
  }, [wallet, connection, userOverview]);

  React.useEffect(() => {
    if (!wallet || !wallet.publicKey || !globalState) {
      return;
    }

    // globalState.totalDebt ? globalState.totalDebt.toNumber() : 1;
    const currentValue = Number(new TokenAmount(globalState.totalDebt as string, 6).fixed());
    setValue(currentValue);

    const maxValue = Number(new TokenAmount(globalState.debtCeiling as string, 6).fixed());

    if (maxValue === 0 || isNaN(maxValue)) {
      setPercentage(0);
      setWarning(false);
    } else {
      const percentageFull = ((currentValue / maxValue) * 100).toFixed(2);
      setPercentage(parseFloat(percentageFull));
      setWarning(currentValue / maxValue === 1);
    }
  }, [wallet, connection, globalState]);

  const label = shouldDisplayLabel ? ProgressBarLabelType.USDr : ProgressBarLabelType.None;

  return (
    <NavBarProgressBar
      className={classNames(
        className,
        { 'navbarprogressbar--warning': warning },
        { 'navbarprogressbar--usdr': !warning }
      )}
      label={label}
      shouldDisplayCurrency={false}
      currentValue={currentValue}
      percentage={percentage}
    />
  );
};

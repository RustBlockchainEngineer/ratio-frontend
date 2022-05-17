import classNames from 'classnames';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';
import { useRFStateInfo } from '../../contexts/state';
import { TokenAmount } from '../../utils/safe-math';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

interface NavBarProgressBarTotalUSDrProps {
  className: string;
  shouldDisplayLabel?: boolean;
}

export const NavBarProgressBarTotalUSDr = (data: NavBarProgressBarTotalUSDrProps) => {
  const { className, shouldDisplayLabel = true } = data;

  const globalState = useRFStateInfo();
  const currentValue = Number(new TokenAmount(globalState?.totalDebt ?? 0, USDR_MINT_DECIMALS).fixed());
  const limit = Number(new TokenAmount(globalState?.debtCeilingGlobal ?? 1, USDR_MINT_DECIMALS).fixed());
  const percentage = (currentValue * 100) / limit;

  const success = percentage <= 80;
  const caution = percentage < 100 && percentage > 80;
  const warning = percentage >= 100;

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
      shouldDisplayCurrency={false}
      currentValue={currentValue}
      percentage={percentage}
    />
  );
};

import classNames from 'classnames';
import { TokenAmount } from '../../utils/safe-math';
import { useRFStateInfo } from '../../contexts/state';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

interface NavBarProgressBarTVLProps {
  className: string;
  shouldDisplayLabel?: boolean;
}

export const NavBarProgressBarTVL = (data: NavBarProgressBarTVLProps) => {
  const { className, shouldDisplayLabel = true } = data;

  const globalState = useRFStateInfo();
  const currentValue = Number(new TokenAmount(globalState?.tvlUsd ?? 0, USDR_MINT_DECIMALS).fixed());
  const limit = Number(new TokenAmount(globalState?.tvlCollatCeilingUsd ?? 1, USDR_MINT_DECIMALS).fixed());
  const percentage = (currentValue * 100) / limit;

  const success = percentage <= 80;
  const caution = percentage < 100 && percentage > 80;
  const warning = percentage >= 100;
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

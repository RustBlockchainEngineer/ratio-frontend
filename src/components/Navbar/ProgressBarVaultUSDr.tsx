import classNames from 'classnames';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';
// import { useRFStateInfo } from '../../contexts/state';
import { TokenAmount } from '../../utils/safe-math';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';
import { usePoolInfo } from '../../contexts/state';

interface ProgressBarVaultUSDrProps {
  className?: string;
  shouldDisplayLabel?: boolean;
  shouldDisplayCurrency?: boolean;
  mint: string;
}

export const ProgressBarVaultUSDr = (data: ProgressBarVaultUSDrProps) => {
  const { className, shouldDisplayLabel = true, shouldDisplayCurrency } = data;

  // const globalState = useRFStateInfo();
  // const vaultState = useUserVaultInfo(data.mint);
  const poolInfo = usePoolInfo(data.mint);
  const currentValue = +new TokenAmount((poolInfo as any)?.totalDebt ?? 0, USDR_MINT_DECIMALS).fixed();
  const limit = Number(new TokenAmount(poolInfo?.debtCeiling ?? 1, USDR_MINT_DECIMALS).fixed());
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
      shouldDisplayCurrency={shouldDisplayCurrency}
      currentValue={currentValue}
      percentage={percentage}
    />
  );
};

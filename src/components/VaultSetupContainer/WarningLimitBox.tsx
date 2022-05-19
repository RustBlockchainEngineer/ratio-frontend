import classNames from 'classnames';
import { TokenAmount } from '../../utils/safe-math';
import { NavBarProgressBar, ProgressBarLabelType } from '../Navbar/NavBarProgressBar';
import highriskIcon from '../../assets/images/highrisk.svg';
import { usePoolInfo } from '../../contexts/state';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

const WarningLimitBox = ({ mint }: any) => {
  const poolInfo = usePoolInfo(mint);

  const currentValue = Number(new TokenAmount(poolInfo?.totalDebt ?? 0, USDR_MINT_DECIMALS).fixed());
  const limit = Number(new TokenAmount(poolInfo?.debtCeiling ?? 1, USDR_MINT_DECIMALS).fixed());
  const percentage = (currentValue * 100) / limit;

  const success = percentage <= 80;
  const caution = percentage < 100 && percentage > 80;
  const warning = percentage >= 100;

  return (
    <div className="warningLimitBox">
      <NavBarProgressBar
        label={ProgressBarLabelType.VaultDebt}
        className={classNames(
          { 'navbarprogressbar--warning': warning },
          { 'navbarprogressbar--caution': caution },
          { 'navbarprogressbar--success': success }
        )}
        shouldDisplayCurrency={false}
        currentValue={currentValue}
        percentage={percentage}
      />
      {warning && (
        <div className="warningLimitBox__warningBox">
          <img src={highriskIcon} alt="highriskIcon" />
          <p>
            <strong>WARNING:</strong> This vault has reached its mintable USDr limit.
          </p>
        </div>
      )}
    </div>
  );
};

export default WarningLimitBox;

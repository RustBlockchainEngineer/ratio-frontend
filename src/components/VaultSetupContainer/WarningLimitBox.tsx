import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { TokenAmount } from '../../utils/safe-math';
import { NavBarProgressBar, ProgressBarLabelType } from '../Navbar/NavBarProgressBar';
import highriskIcon from '../../assets/images/highrisk.svg';
import { usePoolInfo } from '../../contexts/state';

const WarningLimitBox = (mint: any) => {
  const [currentValue, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [success, setSuccess] = useState(false);
  const [caution, setCaution] = useState(false);
  const [warning, setWarning] = useState(false);
  const poolInfo = usePoolInfo(mint.mint);
  const connection = useConnection();
  const { wallet } = useWallet();

  useEffect(() => {
    if (!wallet || !wallet.publicKey || !poolInfo) {
      return;
    }
    const currentValue = Number(new TokenAmount(poolInfo.totalDebt as string, 6).fixed());
    const maxValue = Number(new TokenAmount(poolInfo.debtCeiling as string, 6).fixed());

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
  }, [wallet, connection, poolInfo]);

  return (
    <div className="warningLimitBox">
      <NavBarProgressBar
        label={ProgressBarLabelType.VaultMint}
        className={classNames(
          { 'navbarprogressbar--warning': warning && !caution && !success },
          { 'navbarprogressbar--caution': caution && !warning && !success },
          { 'navbarprogressbar--success': success && !caution && !warning }
        )}
        shouldDisplayCurrency={true}
        currentValue={currentValue}
        percentage={percentage}
      />
      {(caution || warning) && (
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

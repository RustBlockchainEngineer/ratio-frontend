import React from 'react';
import classNames from 'classnames';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { useRFStateInfo } from '../../contexts/state';
import { TokenAmount } from '../../utils/safe-math';
import { NavBarProgressBar, ProgressBarLabelType } from '../Navbar/NavBarProgressBar';
import highriskIcon from '../../assets/images/highrisk.svg';

const WarningLimitBox = () => {
  const [currentValue, setValue] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  //   const [warning, setWarning] = React.useState(false);

  const globalState = useRFStateInfo();

  const connection = useConnection();
  const { wallet } = useWallet();

  React.useEffect(() => {
    if (!wallet || !wallet.publicKey || !globalState) {
      return;
    }

    const currentValue = Number(new TokenAmount(globalState.totalDebt as string, 6).fixed());
    const maxValue = Number(new TokenAmount(globalState.debtCeiling as string, 6).fixed());

    // Current Value
    setValue(currentValue);

    if (maxValue === 0 || isNaN(maxValue)) {
      setPercentage(0);
      //   setWarning(false);
    } else {
      const percentageFull = ((currentValue / maxValue) * 100).toFixed(2);
      setPercentage(parseFloat(percentageFull));
      //   setWarning(currentValue / maxValue === 1);
    }
  }, [wallet, connection, globalState]);

  return (
    <div className="warningLimitBox">
      <NavBarProgressBar
        label={ProgressBarLabelType.VaultMint}
        className={classNames('warningLimitBox__progressbar')}
        shouldDisplayCurrency={true}
        currentValue={currentValue}
        percentage={percentage}
      />
      <div className="warningLimitBox__warningBox">
        <img src={highriskIcon} alt="highriskIcon" />
        <p>
          <strong>WARNING:</strong> This vault has reached its mintable USDr limit.
        </p>
      </div>
    </div>
  );
};

export default WarningLimitBox;

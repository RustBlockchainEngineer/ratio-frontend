import React from 'react';
import classNames from 'classnames';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { usePoolInfo } from '../../../contexts/state';
import { TokenAmount } from '../../../utils/safe-math';
import { NavBarProgressBar } from '../../Navbar/NavBarProgressBar';

const MintableProgressBar = (mint: any) => {
  const [currentValue, setValue] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  const [warning, setWarning] = React.useState(false);

  const poolInfo = usePoolInfo(mint.mint);

  const connection = useConnection();
  const { wallet } = useWallet();

  React.useEffect(() => {
    if (!wallet || !wallet.publicKey || !poolInfo) {
      return;
    }

    let currentValue = Number(new TokenAmount(poolInfo.totalDebt as string, 6).fixed());
    const maxValue = Number(new TokenAmount(poolInfo.debtCeiling as string, 6).fixed());
    currentValue = maxValue - currentValue;

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
  }, [wallet, connection, poolInfo]);

  return (
    <div className="mintableProgressbar">
      <NavBarProgressBar
        className={classNames(
          'mintableProgressbar__progressbar',
          { 'navbarprogressbar--warning': warning },
          { 'navbarprogressbar--usdr': !warning }
        )}
        shouldDisplayCurrency={false}
        currentValue={currentValue}
        percentage={percentage}
      />
    </div>
  );
};

export default MintableProgressBar;

import React from 'react';
import classNames from 'classnames';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { useRFStateInfo } from '../../../contexts/state';
import { TokenAmount } from '../../../utils/safe-math';
import { NavBarProgressBar } from '../../Navbar/NavBarProgressBar';

const MintableProgressBar = () => {
  const [currentValue, setValue] = React.useState(0);
  const [percentage, setPercentage] = React.useState(0);
  const [warning, setWarning] = React.useState(false);

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
      setWarning(false);
    } else {
      const percentageFull = ((currentValue / maxValue) * 100).toFixed(2);
      setPercentage(parseFloat(percentageFull));
      setWarning(currentValue / maxValue === 1);
    }
  }, [wallet, connection, globalState]);

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

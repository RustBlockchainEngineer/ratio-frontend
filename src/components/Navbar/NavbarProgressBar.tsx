import React, { useState } from 'react';
import classNames from 'classnames';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { nFormatter } from '../../utils/utils';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ProgressBar } from 'react-bootstrap';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { getGlobalState } from '../../utils/ratio-lending';

type NavbarProgressBarProps = {
  type: string;
};

const NavbarProgressBar = ({ type }: NavbarProgressBarProps) => {
  const [currentValue, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [warning, setWarning] = useState(false);

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  React.useEffect(() => {
    if (wallet && wallet.publicKey) {
      getGlobalState(connection, wallet).then((res) => {
        if (res) {
          let currentValue;
          let maxValue;
          if (type === 'TVL Cap') {
            currentValue = res.tvl ? res.tvl.toNumber() : 1;
            maxValue = res.tvlLimit ? res.tvlLimit.toNumber() : 20;
          } else if (type === 'USDr Debt') {
            currentValue = res.totalDebt ? res.totalDebt.toNumber() : 1;
            maxValue = res.debtCeiling ? res.debtCeiling.toNumber() : 1;
          } else {
            return;
          }
          setValue(currentValue);
          const percentageFull = ((currentValue / maxValue) * 100).toFixed(2);
          setPercentage(parseInt(percentageFull));
          if (currentValue / maxValue === 1) {
            setWarning(true);
          } else {
            setWarning(false);
          }
        }
      });
    }
  }, [wallet, connection]);

  return (
    <div
      className={classNames(
        'navbarprogressbar',
        { 'navbarprogressbar--warning': warning },
        { 'navbarprogressbar--tvl': type === 'TVL Cap' && !warning },
        { 'navbarprogressbar--usdr': type === 'USDr Debt' && !warning }
      )}
    >
      <div className={classNames('navbarprogressbar__header')}>
        <div>
          <p>{type}</p>
        </div>
        <div className={classNames('detailBox')}>
          <p className={classNames('detailBox__value')}>
            {type === 'TVL Cap' && '$'}
            {currentValue.toFixed(2)}
          </p>
          <p className={classNames('detailBox__percentage')}>{percentage.toFixed(0)}%</p>
        </div>
      </div>
      <ProgressBar now={percentage} />
    </div>
  );
};

export default NavbarProgressBar;

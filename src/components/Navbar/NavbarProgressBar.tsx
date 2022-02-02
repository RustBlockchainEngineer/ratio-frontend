import React, { useState } from 'react';
import classNames from 'classnames';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { nFormatter } from '../../utils/utils';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ProgressBar } from 'react-bootstrap';

type NavbarProgressBarProps = {
  type: string;
};

const NavbarProgressBar = ({ type }: NavbarProgressBarProps) => {
  const [currentValue, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [warning, setWarning] = useState(false);

  const retrieveGlobalTVLData = async () => {
    const currentTVL = 19; //to-do: pull actual value
    const currentTVLlimit = 20; //to-do: pull actual value
    setValue(currentTVL);
    const percentageFull = ((currentTVL / currentTVLlimit) * 100).toFixed(2);
    setPercentage(parseInt(percentageFull));
    if (currentTVL / currentTVLlimit === 1) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  };

  const retrieveGlobalUSDrData = async () => {
    const currentUSDr = 9.86; //to-do: pull actual value
    const currentUSDrlimit = 20; //to-do: pull actual value
    setValue(currentUSDr);
    const percentageFull = ((currentUSDr / currentUSDrlimit) * 100).toFixed(2);
    setPercentage(parseInt(percentageFull));
    if (currentUSDr / currentUSDrlimit === 1) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  };

  React.useEffect(() => {
    if (type === 'TVL Cap') {
      retrieveGlobalTVLData();
      return;
    } else if (type === 'USDr Debt') {
      retrieveGlobalUSDrData();
      return;
    } else {
      return;
    }
  }, [type]);

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

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
  type: ProgressBarType;
};

export enum ProgressBarType {
  TVL = 'TVL Cap',
  USDr = 'USDr Debt',
}

export const NavbarProgressBar = (data: NavbarProgressBarProps) => {
  const [currentValue, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [warning, setWarning] = useState(false);
  const [globalState, setGlobalState] = useState<any>(null);

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  React.useEffect(() => {
    if (wallet && wallet.publicKey) {
      getGlobalState(connection, wallet).then((res) => {
        if (!res) {
          return;
        }
        setGlobalState(res);
      });
    }
    return () => {
      setGlobalState(null);
    };
  }, [wallet, connection]);

  React.useEffect(() => {
    if (!wallet || !wallet.publicKey || !globalState) {
      return;
    }
    let currentValue;
    let maxValue;
    if (data.type === ProgressBarType.TVL) {
      currentValue = globalState.tvl ? globalState.tvl.toNumber() : 1;
      maxValue = globalState.tvlLimit ? globalState.tvlLimit.toNumber() : 20;
    } else if (data.type === ProgressBarType.USDr) {
      currentValue = globalState.totalDebt ? globalState.totalDebt.toNumber() : 1;
      maxValue = globalState.debtCeiling ? globalState.debtCeiling.toNumber() : 1;
    } else {
      return;
    }
    setValue(currentValue);
    const percentageFull = ((currentValue / maxValue) * 100).toFixed(2);
    setPercentage(parseInt(percentageFull));
    setWarning(currentValue / maxValue === 1);
  }, [wallet, connection, globalState]);

  return (
    <div
      className={classNames(
        'navbarprogressbar',
        { 'navbarprogressbar--warning': warning },
        { 'navbarprogressbar--tvl': data.type === ProgressBarType.TVL && !warning },
        { 'navbarprogressbar--usdr': data.type === ProgressBarType.USDr && !warning }
      )}
    >
      <div className={classNames('navbarprogressbar__header')}>
        <div>
          <p>{data.type}</p>
        </div>
        <div className={classNames('detailBox')}>
          <p className={classNames('detailBox__value')}>
            {data.type === ProgressBarType.TVL && '$'}
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

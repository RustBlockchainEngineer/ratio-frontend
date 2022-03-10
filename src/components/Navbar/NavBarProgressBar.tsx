import React from 'react';
import classNames from 'classnames';
import { ProgressBar } from 'react-bootstrap';

type NavBarProgressBarProps = {
  className?: string;
  label?: ProgressBarLabelType;
  shouldDisplayCurrency: boolean;
  currentValue: number;
  percentage: number;
};

export enum ProgressBarLabelType {
  TVL = 'TVL Cap',
  USDr = 'My USDr Debt',
  None = '',
}

export const NavBarProgressBar = (data: NavBarProgressBarProps) => {
  const { className, label, shouldDisplayCurrency = false, currentValue, percentage } = data;

  return (
    <div className={classNames(className, 'navbarprogressbar')}>
      <div className={classNames('navbarprogressbar__header')}>
        {label && (
          <div>
            <p>{label}</p>
          </div>
        )}
        <div className={classNames('detailBox')}>
          <p className={classNames('detailBox__value')}>
            {shouldDisplayCurrency && '$'}
            {currentValue.toFixed(2)}
          </p>
          <p className={classNames('detailBox__percentage')}>{percentage.toFixed(2)}%</p>
        </div>
      </div>
      <ProgressBar now={percentage} />
    </div>
  );
};

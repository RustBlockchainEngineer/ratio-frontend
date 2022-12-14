import React from 'react';
import classNames from 'classnames';
import { usePoolInfo } from '../../../contexts/state';
import { TokenAmount } from '../../../utils/safe-math';
import { NavBarProgressBar } from '../../Navbar/NavBarProgressBar';
import { USDR_MINT_DECIMALS } from '../../../utils/ratio-lending';

const MintableProgressBar = ({ mint }: any) => {
  const poolInfo = usePoolInfo(mint);
  const currentValue = Number(new TokenAmount(poolInfo?.totalDebt ?? 0, USDR_MINT_DECIMALS).fixed());
  const limit = Number(new TokenAmount(poolInfo?.debtCeiling ?? 1, USDR_MINT_DECIMALS).fixed());
  const percentage = (currentValue * 100) / limit;

  const success = percentage <= 80;
  const caution = percentage < 100 && percentage > 80;
  const warning = percentage >= 100;

  return (
    <div className="mintableProgressbar">
      <NavBarProgressBar
        className={classNames(
          'mintableProgressbar__progressbar',
          { 'navbarprogressbar--warning': warning },
          { 'navbarprogressbar--caution': caution },
          { 'navbarprogressbar--success': success }
        )}
        shouldDisplayCurrency={false}
        currentValue={currentValue}
        percentage={percentage}
      />
    </div>
  );
};

export default MintableProgressBar;

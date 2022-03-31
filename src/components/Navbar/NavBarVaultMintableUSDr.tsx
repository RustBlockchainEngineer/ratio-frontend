import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { NavBarProgressBar, ProgressBarLabelType } from './NavBarProgressBar';
import { useVaultInfo } from '../../contexts/state';
import BigNumber from 'bignumber.js';
import { USER_DEBT_CEILING_DECIMALS } from '../../constants';

interface NavBarVaultMintableUSDrProps {
  className: string;
  mint: string;
}

export const NavBarProgressBarVaultMintableUSDr = (data: NavBarVaultMintableUSDrProps) => {
  const { className, mint } = data;

  const [currentValue, setValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [success, setSuccess] = useState(false);
  const [caution, setCaution] = useState(false);
  const [warning, setWarning] = useState(false);

  const vaultInfo = useVaultInfo(mint);

  const connection = useConnection();
  const { wallet } = useWallet();

  useEffect(() => {
    if (!wallet || !wallet.publicKey || !vaultInfo) {
      return;
    }
    /**
     * with the current total debt for the LP vault and the percentage of the current debt divided by the debt ceiling.
     *   // 0-60 full green
     *   // 60-80 orange
     *  // 80-100 red
     */
    const totalDebt = Number(new BigNumber(vaultInfo?.totalDebt)) / 10 ** USER_DEBT_CEILING_DECIMALS;
    const debtCeiling = Number(new BigNumber(vaultInfo?.debtCeiling)) / 10 ** USER_DEBT_CEILING_DECIMALS;
    const currentValue = totalDebt;
    setValue(currentValue);
    const maxValue = debtCeiling;
    const percentageFull = Number(((currentValue / maxValue) * 100).toFixed(2));

    // Current Value
    console.log(vaultInfo);
    console.log('TOTAL DEBT', totalDebt.toString());
    console.log(vaultInfo?.totalDebt.toString());
    console.log(vaultInfo?.debtCeiling.toString());
    console.log(percentageFull);

    if (percentageFull >= 0 && percentageFull <= 0.6) {
      setSuccess(true);
      setCaution(false);
      setWarning(false);
    } else if (percentageFull > 0.6 && percentageFull <= 0.8) {
      setSuccess(false);
      setCaution(true);
      setWarning(false);
    } else if (percentageFull > 0.8) {
      setSuccess(false);
      setCaution(false);
      setWarning(true);
    }
    setPercentage(parseFloat(percentageFull.toString()));
  }, [wallet, connection, vaultInfo]);

  return (
    <NavBarProgressBar
      className={classNames(
        className,
        { 'navbarprogressbar--warning': warning && !caution && !success },
        { 'navbarprogressbar--caution': caution && !warning && !success },
        { 'navbarprogressbar--success': success && !caution && !warning }
      )}
      label={ProgressBarLabelType.None}
      shouldDisplayCurrency={true}
      currentValue={currentValue}
      percentage={percentage}
    />
  );
};

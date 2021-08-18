import React from 'react';

import WalletBalances from './WalletBalances';
import TokensEarned from './TokensEarned';
import LossCalculator from './LossCalculator';
import SystemInfo from './SystemInfo';

const AmountPanel = () => {
  return (
    <div className="amountPanel">
      <WalletBalances />
      <TokensEarned />
      <LossCalculator />
      <SystemInfo />
    </div>
  );
};

export default AmountPanel;

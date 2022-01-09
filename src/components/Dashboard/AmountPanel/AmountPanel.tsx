import React from 'react';

import WalletBalances from './WalletBalances';
import TokensEarned from './TokensEarned';
import LossCalculator from './LossCalculator';
import SystemInfo from './SystemInfo';
import ComingSoon from '../../ComingSoon';

const AmountPanel = (data: any) => {
  return (
    <div className="amountPanel">
      <WalletBalances data={data} />
      <div className="pb-4">
        <TokensEarned />
        {/* <LossCalculator />
          <SystemInfo /> */}
      </div>
    </div>
  );
};

export default AmountPanel;

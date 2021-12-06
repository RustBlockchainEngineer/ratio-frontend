import React from 'react';

import WalletBalances from './WalletBalances';
import TokensEarned from './TokensEarned';
import LossCalculator from './LossCalculator';
import SystemInfo from './SystemInfo';
import ComingSoon from '../../ComingSoon';

const AmountPanel = ({ vault_mint }: any) => {
  return (
    <div className="amountPanel">
      <WalletBalances vault_mint={vault_mint} />
      {/* <ComingSoon enable>
        <div>
          <TokensEarned />
          <LossCalculator />
          <SystemInfo />
        </div>
      </ComingSoon> */}
    </div>
  );
};

export default AmountPanel;

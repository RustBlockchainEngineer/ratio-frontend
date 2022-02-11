import React from 'react';

import TokensEarned from './TokensEarned';
import LossCalculator from './LossCalculator';
import SystemInfo from './SystemInfo';

const AmountPanel = (data: any) => {
  return (
    <div className="amountPanel">
      <div className="pb-4">
        <TokensEarned data={data} />
        {/* <LossCalculator />
          <SystemInfo /> */}
      </div>
    </div>
  );
};

export default AmountPanel;

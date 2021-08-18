import React from 'react';

import Button from '../../Button';

const VaultDebt = () => {
  return (
    <div className="vaultdebt">
      <h4>Vault Debt</h4>
      <p>
        You Owe <strong>$7.45 USDr</strong>
      </p>
      <Button className="button--fill paybackusdr">Pay Back USDr</Button>
    </div>
  );
};

export default VaultDebt;

import React from 'react';

import risklevelIcon from '../../assets/images/risklevel.svg';

const VaultHistoryCard = () => {
  return (
    <div className=" col-6">
      <div className="vaulthistorycard">
        <div className="p-4">
          <div className="d-flex">
            <p className="vaulthistorycard-status">Vault Status</p>
            <img src={risklevelIcon} alt="risklevelIcon" />
          </div>
          <div className="d-flex align-items-center mt-1">
            <p className="vaulthistorycard-price">$90.00</p>
            <p className="vaulthistorycard-unit">(RAY/USD)</p>
          </div>
        </div>
        <div className="vaulthistorycard-bottom p-4">
          <p className="vaulthistorycard-pricelabel">Current Price Information</p>
          <p className="vaulthistorycard-usdprice mt-1">$300.00 USD</p>
        </div>
      </div>
    </div>
  );
};

export default VaultHistoryCard;

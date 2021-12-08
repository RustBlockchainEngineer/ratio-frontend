import React from 'react';
import { useSelector } from 'react-redux';
import { selectors } from '../../features/dashboard';
import CompareCard from '../../components/CompareCard';
import CompareChart from '../../components/CompareChart';

const CompareVaults = () => {
  const compareValutsList = useSelector(selectors.getCompareVaultsList);

  return (
    <div className="compareVaults">
      <h2>Compare Vaults</h2>
      <div className="row mt-4">
        <CompareCard label="Current TVL" list={compareValutsList} type="TVL" />
        <CompareCard label="Current APY" list={compareValutsList} type="APY" />
        <CompareCard label="Current RISK" list={compareValutsList} type="RISK" />
      </div>
      <div className="row">
        <div className="col-6">
          <CompareChart type="TVL" height={1000} containerHeight="86%" />
        </div>
        <div className="col-6">
          <CompareChart type="APY" height={490} containerHeight="73%" />
          <CompareChart type="RISK" height={490} containerHeight="73%" />
        </div>
      </div>
    </div>
  );
};

export default CompareVaults;

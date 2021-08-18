import React, { useState } from 'react';
import useFetch from 'react-fetch-hook';
import FilterPanel from '../../components/FilterPanel';
import TokenPairCard from '../../components/TokenPairCard';
import { getRiskLevel } from '../../libs/helper';
// import stepIcon from '../../assets/images/STEP.svg'
// import usdcIcon from '../../assets/images/USDC.svg'
import rayIcon from '../../assets/images/RAY.svg';
// import solIcon from '../../assets/images/SOL.svg'
import ethIcon from '../../assets/images/ETH.svg';
// import srmIcon from '../../assets/images/SRM.svg'
// import mediaIcon from '../../assets/images/MEDIA.svg'

const AvailableVaults = () => {
  const [viewType, setViewType] = useState('tile');

  const onViewType = (type: string) => {
    setViewType(type);
  };

  const { isLoading, data } = useFetch<any>(
    'https://ratio-finance.herokuapp.com/api/rate'
  );

  function factorialOf(d: any) {
    if (d !== undefined) {
      const p = Object.keys(d).map((key, index) => {
        return {
          id: index,
          icons: [rayIcon, ethIcon],
          title: key,
          tvl: '$20,818,044.40',
          apr: 125,
          details:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
          risk: getRiskLevel(d[key].c)
        };
      });
      return p;
    }
    return [];
  }

  const factorial = React.useMemo(() => factorialOf(data), [data]);

  return (
    <div className="availablevaults">
      <FilterPanel
        label="Available Vaults"
        viewType={viewType}
        onViewType={onViewType}
      />
      <div className="row">
        {isLoading ? (
          <div className="col availablevaults__loading">
            <div className="spinner-border text-info" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          factorial.map((item) => {
            return <TokenPairCard data={item} key={item.id} />;
          })
        )}
      </div>
    </div>
  );
};

export default AvailableVaults;

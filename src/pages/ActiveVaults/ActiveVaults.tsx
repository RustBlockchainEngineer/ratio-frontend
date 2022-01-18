import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { MINTADDRESS, APR, TVL, PLATFORM } from '../../constants';
import { useWallet } from '../../contexts/wallet';
import { PairType } from '../../models/UInterface';
import { selectors, actionTypes } from '../../features/dashboard';

import FilterPanel from '../../components/FilterPanel';
import ComparingFooter from '../../components/ComparingFooter';
import TokenPairCard from '../../components/TokenPairCard';
import TokenPairListItem from '../../components/TokenPairListItem';

import { getCoinPicSymbol } from '../../utils/helper';

const ActiveVaults = () => {
  const dispatch = useDispatch();
  const [viewType, setViewType] = useState('tile');
  const compareValutsList = useSelector(selectors.getCompareVaultsList);
  const filter_data = useSelector(selectors.getFilterData);
  const sort_data = useSelector(selectors.getSortData);
  const overview = useSelector(selectors.getOverview);

  console.log(Object.keys(overview.activeVaults));

  const { connected } = useWallet();

  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const onViewType = (type: string) => {
    setViewType(type);
  };

  const getData = async () => {
    setIsLoading(true);
    const d = await axios.get('https://api.ratio.finance/api/rate');
    setData(d.data);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getData();
  }, []);

  const filterData = (array1: any, array2: any) => {
    if (array2.length === 0) {
      return array1;
    }
    return array1.filter((item1: any) => {
      const item1Str = JSON.stringify(item1);
      return array2.find((item2: any) => {
        return item1Str.indexOf(item2.label) > -1;
      });
    });
  };

  function dynamicSort(property: string) {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    if (property === 'risk') {
      return function (a: any, b: any) {
        const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
      };
    }
    return function (a: any, b: any) {
      const result = a[property] > b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  function factorialOf(d: any, filter_data: any, sort_data: any) {
    if (d !== undefined) {
      const p = filterData(Object.keys(d), filter_data)
        .map((key: any, index: any) => {
          const tokens = key.split('-');

          const aa = Object.keys(overview.activeVaults).indexOf(MINTADDRESS[key]);
          console.log(aa);
          if (aa > -1) {
            return {
              id: index,
              mint: MINTADDRESS[key],
              icons: [getCoinPicSymbol(tokens[0]), getCoinPicSymbol(tokens[1])],
              icon1: getCoinPicSymbol(tokens[0]), //`https://sdk.raydium.io/icons/${getTokenBySymbol(tokens[0])?.mintAddress}.png`,
              icon2: getCoinPicSymbol(tokens[1]),
              title: key,
              tvl: TVL[key],
              platform: PLATFORM[key],
              apr: APR[key],
              details:
                'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
              risk: d[key].c,
              riskPercentage: d[key].r,
              riskLevel: d[key].riskLevel,
            };
          }
        })
        .filter(Boolean);
      p.sort(dynamicSort(sort_data.value));
      return p;
    }
    return [];
  }

  const factorial = React.useMemo(
    () => factorialOf(data, filter_data, sort_data),
    [data, connected, filter_data, sort_data, overview]
  );

  const showContent = (vtype: string) => {
    const onCompareVault = (data: PairType, status: boolean) => {
      if (status) {
        dispatch({ type: actionTypes.SET_COMPARE_VAULTS_LIST, payload: [...compareValutsList, data] });
      } else {
        const arr = compareValutsList.filter((vault: PairType) => vault.id !== data.id);
        dispatch({ type: actionTypes.SET_COMPARE_VAULTS_LIST, payload: arr });
      }
    };

    if (vtype === 'tile') {
      return (
        <div className="row">
          {factorial.map((item: any) => {
            return <TokenPairCard data={item} key={item.id} onCompareVault={onCompareVault} />;
          })}
        </div>
      );
    } else {
      return (
        <table className="table availablevaults__table">
          <thead>
            <tr>
              <th scope="col">Asset</th>
              <th scope="col">Platform</th>
              <th scope="col">APR</th>
              <th scope="col">Risk Level</th>
              <th scope="col" className="availablevaults__table--action"></th>
            </tr>
          </thead>
          <tbody>
            {factorial.map((item: any) => {
              return <TokenPairListItem data={item} key={item.id} onCompareVault={onCompareVault} />;
            })}
          </tbody>
        </table>
      );
    }
  };

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  return (
    <div className="availablevaults">
      <FilterPanel label="Active Vaults" viewType={viewType} onViewType={onViewType} />

      {isLoading ? (
        <div className="col availablevaults__loading">
          <div className="spinner-border text-info" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        showContent(viewType)
      )}
      {compareValutsList.length > 0 && <ComparingFooter list={compareValutsList} />}
    </div>
  );
};

export default ActiveVaults;

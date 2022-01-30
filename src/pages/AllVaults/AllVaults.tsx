import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWallet } from '../../contexts/wallet';
import { PairType } from '../../models/UInterface';
import { selectors, actionTypes } from '../../features/dashboard';

import FilterPanel from '../../components/FilterPanel';
import ComparingFooter from '../../components/ComparingFooter';
import TokenPairCard from '../../components/TokenPairCard';
import TokenPairListItem from '../../components/TokenPairListItem';

import { getCoinPicSymbol } from '../../utils/helper';
import { useFetchVaults } from './useFetchVaults';
import { LPair } from './types';
import { toast } from 'react-toastify';
import { getDebtLimitForAllVaults } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';
import { Banner, BannerIcon } from '../../components/Banner';

const AllVaults = () => {
  const dispatch = useDispatch();
  const [viewType, setViewType] = useState('tile');
  const compareVaultsList = useSelector(selectors.getCompareVaultsList);
  const filter_data = useSelector(selectors.getFilterData);
  const sort_data = useSelector(selectors.getSortData);
  const view_data = useSelector(selectors.getViewData);
  const platform_data = useSelector(selectors.getPlatformData);

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const onViewType = (type: string) => {
    setViewType(type);
  };

  const { status, error, vaults } = useFetchVaults();

  const filterData = (array1: any, array2: any, platform_data: any) => {
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

  function dynamicSort(sortProperty: string, viewProperty: string) {
    const sortOrder = viewProperty === 'ascending' ? 1 : -1;
    return function (a: any, b: any) {
      const result = a[sortProperty] < b[sortProperty] ? -1 : a[sortProperty] > b[sortProperty] ? 1 : 0;
      return result * sortOrder;
    };
  }

  function factorialOf(d: any, filter_data: any, sort_data: any, view_data: any, platform_data: any) {
    if (d !== undefined) {
      const p = filterData(d, filter_data, platform_data).map((item: LPair, index: any) => {
        return {
          id: index,
          mint: item.address_id, //MINTADDRESS[key]
          icons: item.lpasset?.map((item) =>
            item.token_icon?.trim() === '' || item.token_icon === undefined
              ? getCoinPicSymbol(item.token_symbole)
              : item.token_icon
          ),
          title: item.symbol,
          tvl: 'TVL[key]',
          platform: {
            link: item.platform_site,
            name: item.platform_name,
            icon: item.platform_icon,
          },
          apr: 'APR[key]',
          risk: item.risk_rating,
        };
      });
      let x;
      if (platform_data.value !== 'ALL') {
        x = p.filter((item: any) => item.platform.name === platform_data.value);
      } else {
        x = p;
      }
      x.sort(dynamicSort(sort_data.value, view_data.value));
      dispatch({ type: actionTypes.SET_ALL_VAULT, payload: p });
      return x;
    }
    return [];
  }

  const factorial = React.useMemo(
    () => factorialOf(vaults, filter_data, sort_data, view_data, platform_data),
    [vaults, connected, filter_data, sort_data, view_data, platform_data]
  );

  const [hasUserReachedDebtLimit, setHasUserReachedDebtLimit] = React.useState(false);

  React.useEffect(() => {
    if (connected && connection && wallet && factorial.length) {
      getDebtLimitForAllVaults(connection, wallet, factorial).then((vaults: any) => {
        const reducer = (sum: any, currentValue: any) => sum || currentValue.hasReachedDebtLimit;
        const hasReachedDebtLimitReduced: boolean = vaults.reduce(reducer, false);

        setHasUserReachedDebtLimit(hasReachedDebtLimitReduced);
      });
    }
    return () => {
      setHasUserReachedDebtLimit(false);
    };
  }, [connected, connection, wallet, factorial]);

  const showContent = (vtype: string) => {
    const onCompareVault = (data: PairType, status: boolean) => {
      if (status) {
        dispatch({ type: actionTypes.SET_COMPARE_VAULTS_LIST, payload: [...compareVaultsList, data] });
      } else {
        const arr = compareVaultsList.filter((vault: PairType) => vault.id !== data.id);
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
        <table className="table allvaults__table">
          <thead>
            <tr>
              <th scope="col">Asset</th>
              <th scope="col">Platform</th>
              <th scope="col">APR</th>
              <th scope="col">Risk Rating</th>
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
    <>
      {hasUserReachedDebtLimit && (
        <Banner
          title="USDr Debt Limit Reached:"
          message="You have reached your overall USDr Debt Limit"
          bannerIcon={BannerIcon.riskLevel}
          className="debt-limit-reached"
        />
      )}
      <div className="allvaults">
        <FilterPanel label="All Vaults" viewType={viewType} onViewType={onViewType} />

        {status === 'error' && toast.error(error)}
        {status === 'fetching' && (
          <div className="col allvaults__loading">
            <div className="spinner-border text-info" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        {status === 'fetched' && showContent(viewType)}
        {compareVaultsList.length > 0 && <ComparingFooter list={compareVaultsList} />}
      </div>
    </>
  );
};

export default AllVaults;

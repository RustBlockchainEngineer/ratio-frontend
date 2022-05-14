import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWallet } from '../../contexts/wallet';
import { useSaberTvlData } from '../../contexts/platformTvl';
import { PairType } from '../../models/UInterface';
import { selectors, actionTypes } from '../../features/dashboard';

import FilterPanel from '../../components/FilterPanel';
import ComparingFooter from '../../components/ComparingFooter';
import TokenPairCard from '../../components/TokenPairCard';
import ActivePairCard from '../../components/ActivePairCard';
import TokenPairListItem from '../../components/TokenPairListItem';
import { getCoinPicSymbol } from '../../utils/helper';
import { LPair, RISK_RATING } from '../../types/VaultTypes';
import { toast } from 'react-toastify';
import { Banner, BannerIcon } from '../../components/Banner';
// import { useFillPlatformInformation } from '../../hooks/useFillPlatformInformation';
import { useVaultsContextProvider } from '../../contexts/vaults';
import ActivePairListItem from '../../components/ActivePairListItem';
import LoadingSpinner from '../../atoms/LoadingSpinner';

import smallRatioIcon from '../../assets/images/smallRatio.svg';
import { FetchingStatus } from '../../types/fetching-types';
import { useIsTotalUSDrLimitReached } from '../../hooks/useIsTotalUSDrLimitReached';
import { useIsTVLLimitReached } from '../../hooks/useIsTVLLimitReached';
import { useIsUserUSDrLimitReached } from '../../hooks/useIsUserUSDrLimitReached';
import { useAllPoolInfo, useAllVaultInfo, useUserOverview } from '../../contexts/state';

const BaseVaultsPage = ({ showOnlyActive = false, title }: { showOnlyActive: boolean; title: string }) => {
  const dispatch = useDispatch();
  const compareVaultsList = useSelector(selectors.getCompareVaultsList);
  const filter_data = useSelector(selectors.getFilterData);
  const sort_data = useSelector(selectors.getSortData);
  const view_data = useSelector(selectors.getViewData);
  const platform_data = useSelector(selectors.getPlatformData);
  const overview = useUserOverview();
  const userVaultInfos = useAllVaultInfo();
  const poolInfos = useAllPoolInfo();
  const viewType = useSelector(selectors.getViewType);
  const [factorial, setFactorial] = useState<any>([]);

  const hasUserReachedUSDrLimit = useIsUserUSDrLimitReached();
  const hasReachedGlobalDebtLimit = useIsTotalUSDrLimitReached();
  const hasReachedTVLLimit = useIsTVLLimitReached();

  const { connected } = useWallet();

  const onViewType = (type: string) => {
    dispatch({ type: actionTypes.SET_VIEW_TYPE, payload: type });
  };

  const { status, error, vaults } = useVaultsContextProvider();
  const saberTvlData = useSaberTvlData();
  // const vaultsWithPlatformInformation = useFillPlatformInformation(vaults);

  // const [vaultsWithAllData, setVaultsWithAllData] = useState<any>(vaults);

  // eslint-disable-next-line
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
    let sortOrder = viewProperty === 'ascending' ? 1 : -1;
    sortOrder = sortProperty === 'risk' ? 1 : -1;

    return function (a: any, b: any) {
      const result = a[sortProperty] < b[sortProperty] ? -1 : a[sortProperty] > b[sortProperty] ? 1 : 0;
      return result * sortOrder;
    };
  }

  function factorialOf(d: any, filter_data: any, sort_data: any, view_data: any, platform_data: any) {
    if (d !== undefined) {
      const p = filterData(d, filter_data, platform_data)
        ?.map((item: LPair, index: any) => {
          const mint = item.address_id;
          const isVaultActive =
            userVaultInfos && userVaultInfos[mint] && userVaultInfos[mint].totalColl.toNumber() !== 0;
          let tvl = 0;
          let apr = 0;

          if (item.platform_name === 'SABER') {
            tvl = saberTvlData[item.address_id]?.tvl ?? 0;
            apr = saberTvlData[item.address_id]?.apy ?? 0;
          }
          const earned_rewards = userVaultInfos && userVaultInfos[mint] ? userVaultInfos[mint].reward : 0;
          if (showOnlyActive === false || isVaultActive) {
            return {
              id: index,
              mint,
              icons: item.lpasset?.map((item) =>
                item.token_icon?.trim() === '' || item.token_icon === undefined
                  ? getCoinPicSymbol(item.token_symbole)
                  : item.token_icon
              ),
              icon: item.icon,
              title: item.symbol,
              tvl,
              apr,
              earned_rewards,
              platform: {
                link: item.platform_site,
                name: item.platform_name,
                icon: item.platform_icon,
                symbol: item.platform_symbol,
              },
              risk: item.risk_rating,
              riskLevel: RISK_RATING[item.risk_rating as unknown as keyof typeof RISK_RATING],
              item: item,
              activeStatus: isVaultActive,
            };
          }
        })
        .filter(Boolean);
      let x;
      if (platform_data.value !== 'ALL') {
        x = p.filter((item: any) => item.platform.name === platform_data.value);
      } else {
        x = p;
      }

      x.sort(dynamicSort(sort_data.value, view_data.value));
      if (showOnlyActive) {
        dispatch({ type: actionTypes.SET_ACTIVE_VAULT, payload: p });
      } else {
        dispatch({ type: actionTypes.SET_ALL_VAULT, payload: p });
      }
      return x;
    }
    return [];
  }

  useEffect(() => {
    setFactorial(factorialOf(vaults, filter_data, sort_data, view_data, platform_data));
  }, [
    connected,
    filter_data,
    sort_data,
    view_data,
    platform_data,
    overview,
    vaults,
    userVaultInfos,
    poolInfos,
    saberTvlData,
  ]);

  // useEffect(() => {
  //   let vaultsWithData: any = vaults;
  //   if (vaultsWithPlatformInformation.length) {
  //     vaultsWithData = vaultsWithPlatformInformation;
  //   }
  //   setVaultsWithAllData(vaultsWithData);
  //   return () => {
  //     setVaultsWithAllData([]);
  //   };
  //   //In case a cleanup function needs to be added, consider that setting state to default values might race against other pages that use this same base page.
  // }, [vaultsWithPlatformInformation, vaults]);

  const showContent = (vtype: string) => {
    if (!userVaultInfos) {
      return (
        <div className="d-flex justify-content-center mt-5">
          <LoadingSpinner className="spinner-border-lg text-primary" />
        </div>
      );
    }

    const onCompareVault = (data: PairType, status: boolean) => {
      if (status) {
        dispatch({ type: actionTypes.SET_COMPARE_VAULTS_LIST, payload: [...compareVaultsList, data] });
      } else {
        const arr = compareVaultsList.filter((vault: PairType) => vault.id !== data.id);
        dispatch({ type: actionTypes.SET_COMPARE_VAULTS_LIST, payload: arr });
      }
    };

    if (vtype === 'grid') {
      return (
        <div className="row">
          {factorial.map((item: any) => {
            if (!(poolInfos[item.mint] && poolInfos[item.mint].isPaused > 0)) {
              if (showOnlyActive === false)
                return <TokenPairCard data={item} key={item.id} onCompareVault={onCompareVault} />;
              else return <ActivePairCard data={item} key={item.id} onCompareVault={onCompareVault} />;
            }
          })}
        </div>
      );
    } else {
      return (
        <table className="table allvaults__table">
          <thead>
            {showOnlyActive === false ? (
              <tr>
                <th scope="col">Asset</th>
                <th scope="col">Status</th>
                <th scope="col">APY</th>
                <th scope="col">Platform</th>
                <th scope="col">
                  <img src={smallRatioIcon} alt="lisklevel" className="allvaults__table-ratioIcon" />
                  Risk Rating
                </th>
                <th scope="col"></th>
              </tr>
            ) : (
              <tr>
                <th scope="col">Asset</th>
                <th scope="col">APY</th>
                <th scope="col">USDr Debt</th>
                <th scope="col">USDr Available to Mint</th>
                <th scope="col">Rewards Earned</th>
                <th scope="col">Position Value</th>
                <th scope="col">
                  <img src={smallRatioIcon} alt="lisklevel" className="allvaults__table-ratioIcon" />
                  Risk Rating
                </th>
                <th scope="col"></th>
              </tr>
            )}
          </thead>
          <tbody>
            {factorial.map((item: any) => {
              if (!(poolInfos[item.mint] && poolInfos[item.mint].isPaused > 0)) {
                if (showOnlyActive === false)
                  return <TokenPairListItem data={item} key={item.id} onCompareVault={onCompareVault} />;
                else return <ActivePairListItem data={item} key={item.id} onCompareVault={onCompareVault} />;
              }
            })}
          </tbody>
        </table>
      );
    }
  };

  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  return (
    <>
      {overview && (
        <div>
          {hasUserReachedUSDrLimit && !hasReachedGlobalDebtLimit && !hasReachedTVLLimit && (
            <Banner
              title="USDr Debt Limit Reached:"
              message="USDr Debt Limit Reached: You have reached your overall USDr Debt Limit."
              bannerIcon={BannerIcon.riskLevel}
              className="debt-limit-reached"
            />
          )}
          {hasReachedGlobalDebtLimit && !hasReachedTVLLimit && (
            <Banner
              title="USDr Debt Limit Reached:"
              message="USDr Debt Limit Reached: The global debt ceiling on the Ratio platform has been reached."
              bannerIcon={BannerIcon.riskLevel}
              className="debt-limit-reached"
            />
          )}
          {hasReachedTVLLimit && (
            <Banner
              title="TVL Limit Reached:"
              message="TVL Limit Reached: The global deposit ceiling on the Ratio platform has been reached."
              bannerIcon={BannerIcon.riskLevel}
              className="debt-limit-reached"
            />
          )}
        </div>
      )}
      <div className="allvaults mt-4">
        <FilterPanel label={title} viewType={viewType} onViewType={onViewType} />

        {status === FetchingStatus.Error && toast.error(error)}
        {(status === FetchingStatus.Loading || status === FetchingStatus.NotAsked) && (
          <div className="col allvaults__loading">
            <div className="spinner-border text-info" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        {status === FetchingStatus.Finish && showContent(viewType)}
        {compareVaultsList.length > 0 && <ComparingFooter list={compareVaultsList} />}
      </div>
    </>
  );
};

export default BaseVaultsPage;

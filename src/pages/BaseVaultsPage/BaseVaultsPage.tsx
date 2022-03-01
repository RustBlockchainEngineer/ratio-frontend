import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWallet } from '../../contexts/wallet';
import { PairType } from '../../models/UInterface';
import { selectors, actionTypes } from '../../features/dashboard';

import { getRiskLevelNumber } from '../../libs/helper';

import FilterPanel from '../../components/FilterPanel';
import ComparingFooter from '../../components/ComparingFooter';
import TokenPairCard from '../../components/TokenPairCard';
import ActivePairCard from '../../components/ActivePairCard';
import TokenPairListItem from '../../components/TokenPairListItem';
import { TokenAmount } from '../../utils/safe-math';
import { getCoinPicSymbol } from '../../utils/helper';
import { VaultsFetchingStatus } from '../../hooks/useFetchVaults';
import { LPair } from '../../types/VaultTypes';
import { toast } from 'react-toastify';
import { getDebtLimitForAllVaults } from '../../utils/utils';
import { getGlobalState, USDR_MINT_KEY } from '../../utils/ratio-lending';
import { useConnection } from '../../contexts/connection';
import { Banner, BannerIcon } from '../../components/Banner';
import { useFillPlatformInformation } from '../../hooks/useFillPlatformInformation';
import { useVaultsContextProvider } from '../../contexts/vaults';
import ActivePairListItem from '../../components/ActivePairListItem';
import { useMint } from '../../contexts/accounts';

import smallRatioIcon from '../../assets/images/smallRatio.svg';

const BaseVaultsPage = ({ showOnlyActive = false, title }: { showOnlyActive: boolean; title: string }) => {
  const dispatch = useDispatch();
  const [viewType, setViewType] = useState('tile');
  const usdrMint = useMint(USDR_MINT_KEY);
  const compareVaultsList = useSelector(selectors.getCompareVaultsList);
  const filter_data = useSelector(selectors.getFilterData);
  const sort_data = useSelector(selectors.getSortData);
  const view_data = useSelector(selectors.getViewData);
  const platform_data = useSelector(selectors.getPlatformData);
  const overview = useSelector(selectors.getOverview);
  const [factorial, setFactorial] = useState<any>([]);
  const [globalState, setGlobalState] = React.useState(null);
  const [vaultsDebtData, setVaultsDebtData] = React.useState<any>([]);
  const [hasUserReachedDebtLimit, setHasUserReachedDebtLimit] = React.useState(false);
  const [hasReachedGlobalDebtLimit, setHasReachedGlobalDebtLimit] = React.useState(false);
  const [remainingGlobalDebtLimit, setRemainingGlobalDebt] = React.useState(0);

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const onViewType = (type: string) => {
    setViewType(type);
  };

  const { status, error, vaults } = useVaultsContextProvider();

  const vaultsWithPlatformInformation = useFillPlatformInformation(vaults);

  const [vaultsWithAllData, setVaultsWithAllData] = useState<any>(vaults);

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
      const allVaults = filterData(d, filter_data, platform_data).map((item: LPair, index: any) => {
        return {
          id: index,
          mint: item.address_id, //MINTADDRESS[key]
          icons: item.lpasset?.map((item) =>
            item.token_icon?.trim() === '' || item.token_icon === undefined
              ? getCoinPicSymbol(item.token_symbole)
              : item.token_icon
          ),
          icon: item.icon,
          title: item.symbol,
          tvl: item.platform_tvl,
          apr: item.platform_ratio_apy ?? 0,
          earned_rewards: item.earned_rewards,
          platform: {
            link: item.platform_site,
            name: item.platform_name,
            icon: item.platform_icon,
          },
          risk: item.risk_rating,
          riskLevel: getRiskLevelNumber(item.risk_rating),
          item: item,
          hasReachedUserDebtLimit: item.has_reached_user_debt_limit,
          remainingDebt: item.remaining_debt,
        };
      });

      const filteredVaults = allVaults.filter((item: any) =>
        showOnlyActive
          ? Object.keys(overview.activeVaults).indexOf(item.mint) > -1
          : !(Object.keys(overview.activeVaults).indexOf(item.mint) > -1)
      );

      let x;
      if (platform_data.value !== 'ALL') {
        x = filteredVaults.filter((item: any) => item.platform.name === platform_data.value);
      } else {
        x = filteredVaults;
      }
      x.sort(dynamicSort(sort_data.value, view_data.value));

      dispatch({ type: actionTypes.SET_ALL_VAULT, payload: allVaults });

      dispatch({
        type: showOnlyActive ? actionTypes.SET_ACTIVE_VAULT : actionTypes.SET_INACTIVE_VAULT,
        payload: filteredVaults,
      });

      return x;
    }
    return [];
  }

  useEffect(() => {
    if (overview && overview.activeVaults) {
      setFactorial(factorialOf(vaultsWithAllData, filter_data, sort_data, view_data, platform_data));
    }
  }, [connected, filter_data, sort_data, view_data, platform_data, overview, vaultsWithAllData]);

  React.useEffect(() => {
    let active = true;
    if (wallet && wallet.publicKey && usdrMint) {
      getGlobalState(connection, wallet).then((res: any) => {
        if (!active) {
          return;
        }
        const data = res.globalState;
        setGlobalState(data);
        const globalDebt = data?.totalDebt ? Number(new TokenAmount(data?.totalDebt, usdrMint?.decimals).fixed()) : 0;
        const globalDebtLimit = data?.debtCeiling
          ? Number(new TokenAmount(data?.debtCeiling, usdrMint?.decimals).fixed())
          : 0;
        setRemainingGlobalDebt(globalDebtLimit - globalDebt);
        setHasReachedGlobalDebtLimit(
          data?.totalDebt ? data?.totalDebt.toNumber() === data?.debtCeiling.toNumber() : false
        );
      });
    }
    return () => {
      active = false;
    };
  }, [wallet, connection, usdrMint]);

  React.useEffect(() => {
    if (!connected || !connection || !wallet || !vaults.length) {
      return;
    }
    let active = true;
    getDebtLimitForAllVaults(connection, wallet, vaults).then((userVaults: any) => {
      if (!active) {
        return;
      }
      const reducer = (sum: any, currentValue: any) => sum || currentValue.hasReachedDebtLimit;
      const hasReachedDebtLimitReduced: boolean = userVaults.reduce(reducer, false);
      setHasUserReachedDebtLimit(hasReachedDebtLimitReduced);
      setVaultsDebtData(userVaults);
    });
    return () => {
      active = false;
    };
  }, [connected, connection, wallet, vaults]);

  React.useEffect(() => {
    let vaultsWithData: any = vaults;
    if (vaultsWithPlatformInformation.length) {
      vaultsWithData = vaultsWithPlatformInformation;
    }
    vaultsWithData = vaultsWithData.map((item: any) => {
      const remainingUserDebt = vaultsDebtData.length
        ? vaultsDebtData.find((userVault: any) => userVault.title === item.symbol).debtLimit
        : 0;
      const remainingDebt = Math.min(remainingGlobalDebtLimit, remainingUserDebt);
      return {
        ...item,
        remaining_debt: remainingDebt,
        has_reached_user_debt_limit: vaultsDebtData.length
          ? vaultsDebtData.find((userVault: any) => userVault.title === item.symbol).hasReachedDebtLimit
          : false,
      };
    });
    setVaultsWithAllData(vaultsWithData);
    return () => {
      setVaultsWithAllData([]);
    };
    //In case a cleanup function needs to be added, consider that setting state to default values might race against other pages that use this same base page.
  }, [remainingGlobalDebtLimit, vaultsWithPlatformInformation, vaults, vaultsDebtData]);

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
            if (showOnlyActive === false)
              return (
                <TokenPairCard
                  data={item}
                  key={item.id}
                  onCompareVault={onCompareVault}
                  isGlobalDebtLimitReached={hasReachedGlobalDebtLimit}
                />
              );
            else
              return (
                <ActivePairCard
                  data={item}
                  key={item.id}
                  onCompareVault={onCompareVault}
                  isGlobalDebtLimitReached={hasReachedGlobalDebtLimit}
                />
              );
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
                <th scope="col">APY</th>
                <th scope="col">Platform</th>
                {/* <th scope="col">USDr Debt</th>
                <th scope="col">Positoin Value</th>
                <th scope="col">Rewards earned</th>
                <th scope="col">Ratio TVL</th> */}
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
              if (showOnlyActive === false)
                return (
                  <TokenPairListItem
                    data={item}
                    key={item.id}
                    onCompareVault={onCompareVault}
                    isGlobalDebtLimitReached={hasReachedGlobalDebtLimit}
                  />
                );
              else
                return (
                  <ActivePairListItem
                    data={item}
                    key={item.id}
                    onCompareVault={onCompareVault}
                    isGlobalDebtLimitReached={hasReachedGlobalDebtLimit}
                  />
                );
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
      {
        /* TODO: fix this */ false && (
          <Banner
            title="USDr Debt Limit Reached:"
            message="You have reached your overall USDr Debt Limit"
            bannerIcon={BannerIcon.riskLevel}
            className="debt-limit-reached"
          />
        )
      }
      <div className="allvaults">
        <FilterPanel label={title} viewType={viewType} onViewType={onViewType} />

        {status === VaultsFetchingStatus.Error && toast.error(error)}
        {(status === VaultsFetchingStatus.Loading || status === VaultsFetchingStatus.NotAsked) && (
          <div className="col allvaults__loading">
            <div className="spinner-border text-info" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        {status === VaultsFetchingStatus.Finish && showContent(viewType)}
        {compareVaultsList.length > 0 && <ComparingFooter list={compareVaultsList} />}
      </div>
    </>
  );
};

export default BaseVaultsPage;

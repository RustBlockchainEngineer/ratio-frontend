import {
  SET_COMPARE_VAULTS,
  SET_COMPARE_VAULTS_LIST,
  SET_FILTER_DATA,
  SET_AVAILABLE_VAULT,
  SET_SORT_DATA,
  SET_OVERVIEW,
  SET_PLATFORM_DATA,
  SET_ACTIVE_VAULT,
} from './actionTypes';

interface setCompareVaultsAction {
  type: typeof SET_COMPARE_VAULTS;
  payload: any;
}

interface setCompareVaultsListAction {
  type: typeof SET_COMPARE_VAULTS_LIST;
  payload: any;
}

interface setAvailableVaultAction {
  type: typeof SET_AVAILABLE_VAULT;
  payload: any;
}

interface setFilterData {
  type: typeof SET_FILTER_DATA;
  payload: any;
}

interface setSortData {
  type: typeof SET_SORT_DATA;
  payload: any;
}

interface setPlatformData {
  type: typeof SET_PLATFORM_DATA;
  payload: any;
}

interface setOverview {
  type: typeof SET_OVERVIEW;
  payload: any;
}
interface setActiveVaultsAction {
  type: typeof SET_ACTIVE_VAULT;
  payload: any;
}
export interface SystemState {
  dashboard: {
    compare_vaults: false;
    compare_vaults_list: [];
    filter_data: [];
    sort_data: any;
    platform_data: any;
    available_vaults: [];
    active_vaults: [];
    overview: any;
  };
}

export type dashboardActionTypes =
  | setCompareVaultsAction
  | setCompareVaultsListAction
  | setFilterData
  | setAvailableVaultAction
  | setSortData
  | setOverview
  | setPlatformData
  | setActiveVaultsAction;

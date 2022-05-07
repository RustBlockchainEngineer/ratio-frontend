import {
  SET_COMPARE_VAULTS,
  SET_COMPARE_VAULTS_LIST,
  SET_FILTER_DATA,
  SET_ALL_VAULT,
  SET_SORT_DATA,
  SET_VIEW_DATA,
  SET_PLATFORM_DATA,
  SET_ACTIVE_VAULT,
  SET_INACTIVE_VAULT,
  SET_VIEW_TYPE,
} from './actionTypes';

interface setCompareVaultsAction {
  type: typeof SET_COMPARE_VAULTS;
  payload: any;
}

interface setCompareVaultsListAction {
  type: typeof SET_COMPARE_VAULTS_LIST;
  payload: any;
}

interface setAllVaultAction {
  type: typeof SET_ALL_VAULT;
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

interface setViewData {
  type: typeof SET_VIEW_DATA;
  payload: any;
}

interface setActiveVaultsAction {
  type: typeof SET_ACTIVE_VAULT;
  payload: any;
}

interface setInactiveVaultsAction {
  type: typeof SET_INACTIVE_VAULT;
  payload: any;
}

interface setViewType {
  type: typeof SET_VIEW_TYPE;
  payload: any;
}

export interface SystemState {
  dashboard: {
    compare_vaults: false;
    compare_vaults_list: [];
    filter_data: [];
    sort_data: any;
    view_data: any;
    platform_data: any;
    all_vaults: [];
    active_vaults: [];
    inactive_vaults: [];
    overview: any;
    view_type: string;
  };
}

export type dashboardActionTypes =
  | setCompareVaultsAction
  | setCompareVaultsListAction
  | setFilterData
  | setAllVaultAction
  | setSortData
  | setViewData
  | setPlatformData
  | setActiveVaultsAction
  | setInactiveVaultsAction
  | setViewType;

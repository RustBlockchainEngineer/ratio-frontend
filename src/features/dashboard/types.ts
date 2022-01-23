import {
  SET_COMPARE_VAULTS,
  SET_COMPARE_VAULTS_LIST,
  SET_FILTER_DATA,
  SET_AVAILABLE_VAULT,
  SET_SORT_DATA,
  SET_VIEW_DATA,
  SET_OVERVIEW,
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

interface setViewData {
  type: typeof SET_VIEW_DATA;
  payload: any;
}

interface setOverview {
  type: typeof SET_OVERVIEW;
  payload: any;
}

export interface SystemState {
  dashboard: {
    compare_vaults: false;
    compare_vaults_list: [];
    filter_data: [];
    sort_data: any;
    view_data: any;
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
  | setViewData
  | setOverview;

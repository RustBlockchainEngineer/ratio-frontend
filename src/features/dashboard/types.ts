import { SET_COMPARE_VAULTS, SET_COMPARE_VAULTS_LIST, SET_FILTER_DATA } from './actionTypes';

interface setCompareVaultsAction {
  type: typeof SET_COMPARE_VAULTS;
  payload: any;
}

interface setCompareVaultsListAction {
  type: typeof SET_COMPARE_VAULTS_LIST;
  payload: any;
}

interface setFilterData {
  type: typeof SET_FILTER_DATA;
  payload: any;
}

export interface SystemState {
  dashboard: {
    compare_vaults: false;
    compare_vaults_list: [];
    filter_data: [];
  };
}

export type dashboardActionTypes = setCompareVaultsAction | setCompareVaultsListAction | setFilterData;
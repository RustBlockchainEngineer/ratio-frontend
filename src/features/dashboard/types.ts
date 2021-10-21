import { SET_COMPARE_VAULTS, SET_COMPARE_VAULTS_LIST } from './actionTypes';

interface setCompareVaultsAction {
  type: typeof SET_COMPARE_VAULTS;
  payload: any;
}

interface setCompareVaultsListAction {
  type: typeof SET_COMPARE_VAULTS_LIST;
  payload: any;
}

export interface SystemState {
  dashboard: {
    compare_vaults: false;
    compare_vaults_list: [];
  };
}

export type dashboardActionTypes = setCompareVaultsAction | setCompareVaultsListAction;

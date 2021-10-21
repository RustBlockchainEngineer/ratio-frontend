import { SET_COMPARE_VAULTS } from './actionTypes';

interface setCompareVaultsAction {
  type: typeof SET_COMPARE_VAULTS;
  payload: any;
}

export interface SystemState {
  dashboard: {
    compare_vaults: false;
  };
}

export type dashboardActionTypes = setCompareVaultsAction;

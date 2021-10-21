import { SystemState } from './types';

export const getCompareVaultsStatus = (state: SystemState) => state.dashboard.compare_vaults;

export const getCompareVaultsList = (state: SystemState) => state.dashboard.compare_vaults_list;

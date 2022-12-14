import { SystemState } from './types';

export const getCompareVaultsStatus = (state: SystemState) => state.dashboard.compare_vaults;

export const getCompareVaultsList = (state: SystemState) => state.dashboard.compare_vaults_list;

export const getFilterData = (state: SystemState) => state.dashboard.filter_data;

export const getSortData = (state: SystemState) => state.dashboard.sort_data;

export const getViewData = (state: SystemState) => state.dashboard.view_data;

export const getAllVaults = (state: SystemState) => state.dashboard.all_vaults;

export const getOverview = (state: SystemState) => state.dashboard.overview;

export const getPlatformData = (state: SystemState) => state.dashboard.platform_data;

export const getActiveVaults = (state: SystemState) => state.dashboard.active_vaults;

export const getViewType = (state: SystemState) => state.dashboard.view_type;

export const getTermsConditions = (state: SystemState) => state.dashboard.terms_conditions;

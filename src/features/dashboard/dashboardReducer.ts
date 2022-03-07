/* eslint-disable no-case-declarations */
import {
  SET_COMPARE_VAULTS,
  SET_COMPARE_VAULTS_LIST,
  SET_FILTER_DATA,
  SET_ALL_VAULT,
  SET_SORT_DATA,
  SET_VIEW_DATA,
  SET_OVERVIEW,
  SET_PLATFORM_DATA,
  SET_ACTIVE_VAULT,
  SET_INACTIVE_VAULT,
  SET_VIEW_TYPE,
} from './actionTypes';
import { dashboardActionTypes } from './types';

const initialState = {
  compare_vaults: false,
  compare_vaults_list: [],
  filter_data: [],
  sort_data: { value: 'apr', label: 'APY' },
  view_data: { value: 'ascending', label: 'Ascending' },
  all_vaults: [],
  active_vaults: [],
  overview: {},
  view_type: 'grid',
  platform_data: { value: 'ALL', label: 'All platforms' },
};

export default (state = initialState, action: dashboardActionTypes) => {
  switch (action.type) {
    case SET_COMPARE_VAULTS:
      return { ...state, compare_vaults: action.payload };
    case SET_COMPARE_VAULTS_LIST:
      return { ...state, compare_vaults_list: action.payload };
    case SET_FILTER_DATA:
      return { ...state, filter_data: action.payload };
    case SET_ALL_VAULT:
      return { ...state, all_vaults: action.payload };
    case SET_ACTIVE_VAULT:
      return { ...state, active_vaults: action.payload };
    case SET_INACTIVE_VAULT:
      return { ...state, active_vaults: action.payload };
    case SET_SORT_DATA:
      return { ...state, sort_data: action.payload };
    case SET_VIEW_DATA:
      return { ...state, view_data: action.payload };
    case SET_PLATFORM_DATA:
      return { ...state, platform_data: action.payload };
    case SET_OVERVIEW:
      return { ...state, overview: action.payload };
    case SET_VIEW_TYPE:
      return { ...state, view_type: action.payload };
    default:
      return state;
  }
};

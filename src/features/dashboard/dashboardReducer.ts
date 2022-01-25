/* eslint-disable no-case-declarations */
import {
  SET_COMPARE_VAULTS,
  SET_COMPARE_VAULTS_LIST,
  SET_FILTER_DATA,
  SET_AVAILABLE_VAULT,
  SET_SORT_DATA,
  SET_VIEW_DATA,
  SET_OVERVIEW,
  SET_PLATFORM_DATA,
  SET_ACTIVE_VAULT,
} from './actionTypes';
import { dashboardActionTypes } from './types';

const initialState = {
  compare_vaults: false,
  compare_vaults_list: [],
  filter_data: [],
  sort_data: { value: 'apr', label: 'APR' },
  view_data: { value: 'ascending', label: 'Ascending' },
  available_vaults: [],
  active_vaults: [],
  overview: {},
  platform_data: { value: 'ALL', label: 'All' },
};

export default (state = initialState, action: dashboardActionTypes) => {
  switch (action.type) {
    case SET_COMPARE_VAULTS:
      return { ...state, compare_vaults: action.payload };
    case SET_COMPARE_VAULTS_LIST:
      return { ...state, compare_vaults_list: action.payload };
    case SET_FILTER_DATA:
      return { ...state, filter_data: action.payload };
    case SET_AVAILABLE_VAULT:
      return { ...state, available_vaults: action.payload };
    case SET_ACTIVE_VAULT:
      return { ...state, active_vaults: action.payload };
    case SET_SORT_DATA:
      return { ...state, sort_data: action.payload };
    case SET_VIEW_DATA:
      return { ...state, view_data: action.payload };
    case SET_PLATFORM_DATA:
      return { ...state, platform_data: action.payload };
    case SET_OVERVIEW:
      return { ...state, overview: action.payload };
    default:
      return state;
  }
};

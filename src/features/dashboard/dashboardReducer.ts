import { SET_COMPARE_VAULTS, SET_COMPARE_VAULTS_LIST } from './actionTypes';
import { dashboardActionTypes } from './types';

const initialState = {
  compare_vaults: false,
  compare_vaults_list: [],
};

export default (state = initialState, action: dashboardActionTypes) => {
  switch (action.type) {
    case SET_COMPARE_VAULTS:
      return { ...state, compare_vaults: action.payload };
    case SET_COMPARE_VAULTS_LIST:
      return { ...state, compare_vaults_list: action.payload };
    default:
      return state;
  }
};

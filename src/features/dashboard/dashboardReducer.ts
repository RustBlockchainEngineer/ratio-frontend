import { SET_COMPARE_VAULTS } from './actionTypes';
import { dashboardActionTypes } from './types';

const initialState = {
  connected_status: false,
};

export default (state = initialState, action: dashboardActionTypes) => {
  switch (action.type) {
    case SET_COMPARE_VAULTS:
      return { ...state, compare_vaults: action.payload };
    default:
      return state;
  }
};

import { CONNECTED_WALLET, SET_WHITELIST } from './actionTypes';
import { WalletActionTypes } from './types';

const initialState = {
  connected_status: false,
  whitelist_data: [],
};

export default (state = initialState, action: WalletActionTypes) => {
  switch (action.type) {
    case CONNECTED_WALLET:
      return { ...state, connected_status: true };
    case SET_WHITELIST:
      return { ...state, whitelist_data: action.payload };
    default:
      return state;
  }
};

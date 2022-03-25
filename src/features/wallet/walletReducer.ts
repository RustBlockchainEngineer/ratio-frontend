import { CONNECTED_WALLET, SET_WHITELIST, SET_NETWORK } from './actionTypes';
import { WalletActionTypes } from './types';
import { Networks } from '../../constants';

const initialState = {
  connected_status: false,
  network: Networks[1],
  whitelist_data: [],
};

export default (state = initialState, action: WalletActionTypes) => {
  switch (action.type) {
    case CONNECTED_WALLET:
      return { ...state, connected_status: true };
    case SET_WHITELIST:
      return { ...state, whitelist_data: action.payload };
    case SET_NETWORK:
      return { ...state, network: action.payload };
    default:
      return state;
  }
};

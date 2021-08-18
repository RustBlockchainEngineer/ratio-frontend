import { CONNECTED_WALLET } from './actionTypes';
import { WalletActionTypes } from './types';

const initialState = {
  connected_status: false
};

export default (state = initialState, action: WalletActionTypes) => {
  switch (action.type) {
    case CONNECTED_WALLET:
      return { ...state, connected_status: true };
    default:
      return state;
  }
};

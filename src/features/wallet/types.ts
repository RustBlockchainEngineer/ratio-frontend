import { CONNECTED_WALLET, SET_WHITELIST } from './actionTypes';

interface ConnectedWalletAction {
  type: typeof CONNECTED_WALLET;
}

interface SetWhiteListDataAction {
  type: typeof SET_WHITELIST;
  payload: any;
}

export interface SystemState {
  wallet: {
    connected_status: false;
    whitelist_data: [];
  };
}

export type WalletActionTypes = ConnectedWalletAction | SetWhiteListDataAction;

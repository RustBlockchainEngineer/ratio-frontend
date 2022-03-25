import { CONNECTED_WALLET, SET_WHITELIST, SET_NETWORK } from './actionTypes';

interface ConnectedWalletAction {
  type: typeof CONNECTED_WALLET;
}

interface SetWhiteListDataAction {
  type: typeof SET_WHITELIST;
  payload: any;
}

interface SetNetworkAction {
  type: typeof SET_NETWORK;
  payload: any;
}

export interface SystemState {
  wallet: {
    connected_status: false;
    whitelist_data: [];
    network: any;
  };
}

export type WalletActionTypes = ConnectedWalletAction | SetWhiteListDataAction | SetNetworkAction;

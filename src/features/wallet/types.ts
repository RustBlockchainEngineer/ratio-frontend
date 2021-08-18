import { CONNECTED_WALLET } from './actionTypes';

interface ConnectedWalletAction {
  type: typeof CONNECTED_WALLET;
}

export interface SystemState {
  wallet: {
    connected_status: false;
  };
}

export type WalletActionTypes = ConnectedWalletAction;

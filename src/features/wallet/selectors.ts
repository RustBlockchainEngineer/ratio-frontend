import { SystemState } from './types';

export const getConnectedStatus = (state: SystemState) => state.wallet.connected_status;

export const getWhiteListData = (state: SystemState) => state.wallet.whitelist_data;

export const getNetwork = (state: SystemState) => state.wallet.network;

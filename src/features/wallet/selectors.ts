import { SystemState } from './types'

export const getConnectedStatus = (state: SystemState) =>
  state.wallet.connected_status

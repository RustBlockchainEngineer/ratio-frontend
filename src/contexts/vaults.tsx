import React from 'react';
import { useFetchVaults } from '../hooks/useFetchVaults';
import { FetchingStatus } from '../types/fetching-types';
import { LPair } from '../types/VaultTypes';
// import { useWallet } from './wallet';

export const VAULTS_CONTEXT_DEFAULT_VALUE: {
  status: FetchingStatus;
  vaults: LPair[];
  error: any;
  forceUpdate: () => void;
} = {
  status: FetchingStatus.NotAsked,
  vaults: [],
  error: undefined,
  forceUpdate: () => {},
};

const VaultsContext = React.createContext(VAULTS_CONTEXT_DEFAULT_VALUE);

export const VaultsContextProvider = (props: any) => {
  // const { wallet } = useWallet();
  // const { status, error, vaults, forceUpdate } = useFetchVaults(wallet?.publicKey);
  const { status, error, vaults, forceUpdate } = useFetchVaults();
  const value = {
    status,
    error,
    vaults,
    forceUpdate,
  };
  return <VaultsContext.Provider value={value}>{props.children}</VaultsContext.Provider>;
};

export const useVaultsContextProvider = () => {
  const context = React.useContext(VaultsContext);
  if (!context) {
    throw new Error('[useVaultsContextProvider] Hook not used under Vaults context provider');
  }
  return context;
};

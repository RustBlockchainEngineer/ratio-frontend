import React from 'react';
import { useFetchVaults, VaultsFetchingStatus } from '../hooks/useFetchVaults';
import { LPair } from '../types/VaultTypes';

export const VAULTS_CONTEXT_DEFAULT_VALUE: {
  status: VaultsFetchingStatus;
  vaults: LPair[];
  error: any;
  forceUpdate: () => void;
} = {
  status: VaultsFetchingStatus.NotAsked,
  vaults: [],
  error: undefined,
  forceUpdate: () => {},
};

const VaultsContext = React.createContext(VAULTS_CONTEXT_DEFAULT_VALUE);

export const VaultsContextProvider = (props: any) => {
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

import React from 'react';
import { useFetchVaults, VaultsFetchingStatus } from '../hooks/useFetchVaults';

export const VAULTS_CONTEXT_DEFAULT_VALUE = {
  status: VaultsFetchingStatus.NotAsked,
  vaults: [],
  error: undefined,
};

const VaultsContext = React.createContext(VAULTS_CONTEXT_DEFAULT_VALUE);

export const VaultsContextProvider = (props: any) => {
  const { status, error, vaults } = useFetchVaults();
  const value = {
    status,
    error,
    vaults,
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

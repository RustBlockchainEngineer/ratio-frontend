import React, { useContext, useState } from 'react';

interface AuthConfig {
  loggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  updateWalletFlag: boolean;
  setUpdateWalletFlag: (val: boolean) => void;
  updateHistory: boolean;
  setUpdateHistory: (val: boolean) => void;
}

const AuthContext = React.createContext<AuthConfig>({
  loggedIn: false,
  setLoggedIn: () => {},

  updateWalletFlag: false,
  setUpdateWalletFlag: () => {},

  updateHistory: false,
  setUpdateHistory: () => {},
});

export function AuthProvider({ children = undefined as any }) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [updateWalletFlag, setUpdateWalletFlag] = useState<boolean>(false);
  const [updateHistory, setUpdateHistory] = useState<boolean>(false);
  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        updateWalletFlag,
        setUpdateWalletFlag,
        updateHistory,
        setUpdateHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useLoggedIn() {
  return {
    loggedIn: useContext(AuthContext)?.loggedIn,
    setLoggedIn: useContext(AuthContext)?.setLoggedIn,
  };
}

export function useUpdateHistory() {
  return {
    updateHistoryFlag: useContext(AuthContext)?.updateHistory,
    setUpdateHistoryFlag: useContext(AuthContext)?.setUpdateHistory,
  };
}

export function useUpdateWallet() {
  return {
    updateWalletFlag: useContext(AuthContext)?.updateWalletFlag,
    setUpdateWalletFlag: useContext(AuthContext)?.setUpdateWalletFlag,
  };
}

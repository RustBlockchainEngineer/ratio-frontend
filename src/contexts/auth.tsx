import React, { useContext, useEffect, useMemo, useState } from 'react';

interface AuthConfig {
  loggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
  updateState: boolean;
  setUpdateState: (val: boolean) => void;
  updateHistory: boolean;
  setUpdateHistory: (val: boolean) => void;
}

const AuthContext = React.createContext<AuthConfig>({
  loggedIn: false,
  setLoggedIn: () => {},
  updateState: false,
  setUpdateState: () => {},

  updateHistory: false,
  setUpdateHistory: () => {},
});

export function AuthProvider({ children = undefined as any }) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [updateState, setUpdateState] = useState<boolean>(false);
  const [updateHistory, setUpdateHistory] = useState<boolean>(false);
  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        updateState,
        setUpdateState,
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

export function useUpdateState() {
  return {
    updateStateFlag: useContext(AuthContext)?.updateState,
    setUpdateStateFlag: useContext(AuthContext)?.setUpdateState,
  };
}

export function useUpdateHistory() {
  return {
    updateHistoryFlag: useContext(AuthContext)?.updateHistory,
    setUpdateHistoryFlag: useContext(AuthContext)?.setUpdateHistory,
  };
}

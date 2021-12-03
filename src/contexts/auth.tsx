import React, { useContext, useEffect, useMemo, useState } from 'react';

interface AuthConfig {
  loggedIn: boolean;
  setLoggedIn: (val: boolean) => void;
}

const AuthContext = React.createContext<AuthConfig>({
  loggedIn: false,
  setLoggedIn: () => {},
});

export function AuthProvider({ children = undefined as any }) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // console.log('check loggedin', loggedIn);
  }, [loggedIn]);

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSetLoggedIn() {
  return useContext(AuthContext)?.setLoggedIn;
}

export function useGetLoggedIn() {
  return useContext(AuthContext)?.loggedIn;
}

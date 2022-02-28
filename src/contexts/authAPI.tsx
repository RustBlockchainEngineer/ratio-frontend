import React from 'react';
import { API_ENDPOINT } from '../constants/constants';
import { useWallet } from './wallet';

export const AuthContextStatus = {
  NotAsked: 'notAsked',
  Loading: 'loading',
  Finish: 'finish',
  Error: 'error',
};

export const AUTH_CONTEXT_DEFAULT_VALUE = {
  status: AuthContextStatus.NotAsked,
  accessToken: '',
  user: null,
  disconnect: async () => {
    return;
  },
};

const AuthContext = React.createContext(AUTH_CONTEXT_DEFAULT_VALUE);

export const AuthContextProvider = (props: any) => {
  const [status, setStatus] = React.useState(AuthContextStatus.NotAsked);
  const [user, setUser] = React.useState(null);
  const [accessToken, setAccessToken] = React.useState('');

  const { publicKey, disconnect: disconnectWeb3, connected } = useWallet();

  const fetchUser = React.useCallback(
    async (userAddress: string | undefined) => {
      const response = await fetch(`${API_ENDPOINT}/users/${userAddress}`);
      if (!response.ok) {
        throw await response.json();
      }
      return response.json();
    },
    [publicKey]
  );

  const disconnect = React.useCallback(async () => {
    await disconnectWeb3();
    setStatus(AuthContextStatus.NotAsked);
    setAccessToken('');
  }, [disconnectWeb3]);

  const handleSignMessage = React.useCallback(
    async (nonce: string) => {
      const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}.`;
      const encodedMessage = new TextEncoder().encode(message);
      return (window as any).solana.request({
        method: 'signMessage',
        params: {
          message: encodedMessage,
        },
      });
    },
    [fetchUser]
  );

  const handleAuthenticate = React.useCallback(
    async ({ publicAddress, signature }) => {
      const response = await fetch(`${API_ENDPOINT}/auth/`, {
        body: JSON.stringify({ publicAddress, signature }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      if (!response.ok) {
        throw await response.json();
      }
      return response.json();
    },
    [handleSignMessage]
  );

  const auth = React.useCallback(
    async (publicKey) => {
      try {
        if (status === AuthContextStatus.Loading) {
          return;
        }
        setStatus(AuthContextStatus.Loading);
        const publicAddress = publicKey?.toString();

        // Look if user with current publicAddress is already present on backend
        const fetchedUser = await fetchUser(publicAddress);

        const { signature } = await handleSignMessage(fetchedUser.nonce.toString());

        // Send signature to backend on the /auth route
        const { token } = await handleAuthenticate({
          publicAddress,
          signature,
        });

        if (token) {
          setUser(fetchedUser);
          setAccessToken(token);
          setStatus(AuthContextStatus.Finish);
        } else {
          throw 'There was an error authenticating to the API, no token found';
        }
      } catch (err) {
        await disconnect();
        console.error(err);
        setStatus(AuthContextStatus.Error);
      }
    },
    [disconnect, handleAuthenticate]
  );

  React.useEffect(() => {
    if (!connected) {
      setAccessToken('');
      setStatus(AuthContextStatus.NotAsked);
    } else {
      auth(publicKey);
    }
  }, [publicKey, connected]);

  const value = {
    status,
    accessToken,
    user,
    disconnect,
  };

  console.log(`AuthContext`, value);
  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
};

export const useAuthContextProvider = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('[useAuthContextProvider] Hook not used under Auth context provider');
  }
  return context;
};

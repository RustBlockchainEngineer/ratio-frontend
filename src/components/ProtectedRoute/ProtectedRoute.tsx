import { createElement, useState, useEffect } from 'react';
import { API_ENDPOINT } from './../../constants/constants';
import { Route } from 'react-router-dom';
import { useWallet } from '../../contexts/wallet';
import Unauthorized from '../../pages/Unauthorized';
import Forbidden from '../../pages/Forbidden';

const ProtectedRoute = ({ component, ...rest }: any) => {
  const [allowed, setAllowed] = useState(false);
  const { connected, publicKey } = useWallet();
  const fetchUserAllowed = async (userAddress: string | undefined) => {
    const response = await fetch(`${API_ENDPOINT}/admin_whitelist?add=${userAddress}`);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const result = await response.json();
    return result;
  };

  useEffect(() => {
    const fetchAndSet = async () => {
      if (publicKey !== undefined) {
        const data = await fetchUserAllowed(publicKey?.toString());
        if (data !== undefined) {
          setAllowed(data);
        }
      }
    };

    fetchAndSet();
  }, [publicKey]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (connected) {
          if (allowed) {
            return createElement(component, props);
          } else {
            return <Forbidden />;
          }
        } else {
          return <Unauthorized />;
        }
      }}
    />
  );
};

export default ProtectedRoute;

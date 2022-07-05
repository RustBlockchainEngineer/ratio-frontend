import { createElement } from 'react';
import { Route } from 'react-router-dom';
import { useWallet } from '../../contexts/wallet';
import { useAuthContextProvider } from '../../contexts/authAPI';
import Unauthorized from '../../pages/Unauthorized';
import Forbidden from '../../pages/Forbidden';

const ProtectedRoute = ({ roles, component, ...rest }: any) => {
  const { connected } = useWallet();
  const { user } = useAuthContextProvider();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (connected) {
          if (user && roles.indexOf((user as any).role) > -1) {
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

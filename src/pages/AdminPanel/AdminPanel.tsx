import { Redirect, Route, Switch } from 'react-router-dom';
import FeesAdminForm from '../FeesAdminForm';
import WhitelistAdminForm from '../WhitelistAdminForm';
import CollRatiosAdminForm from '../CollRatiosAdminForm';
import { AuthContextProvider as APIAuthContextProvider } from '../../contexts/authAPI';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Roles } from '../../constants';
import GlobalParamsAdminForm from '../GlobalParamsAdminForm';
import VaultCreationAdminForm from '../VaultCreationAdminForm';
import NotFound from '../NotFound';
import AdminTasksForm from '../AdminTasksForm';
import TokensAdminForm from '../TokensAdminForm';

const AdminPanel = () => {
  return (
    <APIAuthContextProvider>
      <div className="adminpanel">
        <Switch>
          <ProtectedRoute
            roles={[Roles.ADMIN, Roles.DEVELOPER]}
            path="/adminpanel/fees"
            component={FeesAdminForm}
            exact
          />
          <ProtectedRoute
            roles={[Roles.ADMIN, Roles.DEVELOPER]}
            path="/adminpanel/whitelist"
            component={WhitelistAdminForm}
            exact
          />
          <ProtectedRoute
            roles={[Roles.ADMIN, Roles.DEVELOPER]}
            path="/adminpanel/vaults"
            component={VaultCreationAdminForm}
            exact
          />
          <ProtectedRoute
            roles={[Roles.ADMIN, Roles.DEVELOPER]}
            path="/adminpanel/globalparams"
            component={GlobalParamsAdminForm}
            exact
          />
          <ProtectedRoute
            roles={[Roles.ADMIN, Roles.DEVELOPER]}
            path="/adminpanel/tasks"
            component={AdminTasksForm}
            exact
          />
          <ProtectedRoute
            roles={[Roles.ADMIN, Roles.DEVELOPER]}
            path="/adminpanel/tokens"
            component={TokensAdminForm}
            exact
          />
          <ProtectedRoute
            roles={[Roles.ADMIN, Roles.DEVELOPER]}
            path="/adminpanel/collateralizationratios"
            component={CollRatiosAdminForm}
            exact
          />
          <Route exact path="/adminpanel">
            <Redirect to="/adminpanel/globalparams" />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </APIAuthContextProvider>
  );
};

export default AdminPanel;

import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import * as dotenv from 'dotenv';
import { WalletProvider } from './contexts/wallet';
import { ConnectionProvider } from './contexts/connection';
import { AccountsProvider } from './contexts/accounts';
// import { MarketProvider } from './contexts/market';
import { ThemeProvider } from './contexts/ThemeContext';
import Layer from './pages/Layer';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './contexts/auth';
import NotFound from './pages/NotFound';
import { VaultsContextProvider } from './contexts/vaults';
import { RFStateProvider } from './contexts/state';

dotenv.config();
const App: React.FC = () => {
  return (
    <ConnectionProvider>
      <AuthProvider>
        <WalletProvider>
          <AccountsProvider>
            <ThemeProvider>
              <VaultsContextProvider>
                <RFStateProvider>
                  <Router>
                    <Switch>
                      <Route path="/dashboard" component={Layer} />
                      <Route path="/adminpanel" component={AdminPanel} />
                      <Route exact path="/">
                        <Redirect to="/dashboard" />
                      </Route>
                      <Route component={NotFound} />
                    </Switch>
                  </Router>
                </RFStateProvider>
              </VaultsContextProvider>
            </ThemeProvider>
          </AccountsProvider>
        </WalletProvider>
      </AuthProvider>
    </ConnectionProvider>
  );
};

export default App;

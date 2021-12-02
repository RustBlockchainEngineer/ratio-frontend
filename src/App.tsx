import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { WalletProvider } from './contexts/wallet';
import { ConnectionProvider } from './contexts/connection';
import { AccountsProvider } from './contexts/accounts';
import { MarketProvider } from './contexts/market';
import { ThemeProvider } from './contexts/ThemeContext';
import Layer from './pages/Layer';
import Faucet from './pages/Faucet';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './contexts/auth';

const App: React.FC = () => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <AuthProvider>
          <AccountsProvider>
            <MarketProvider>
              <ThemeProvider>
                <Router>
                  <div>
                    <Switch>
                      <Route path="/dashboard" component={Layer} />
                      <Route path="/faucet" exact component={Faucet} />
                      <Route path="/adminpanel" exact component={AdminPanel} />
                      <Route exact path="/">
                        <Redirect to="/dashboard" />
                      </Route>
                    </Switch>
                  </div>
                </Router>
              </ThemeProvider>
            </MarketProvider>
          </AccountsProvider>
        </AuthProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;

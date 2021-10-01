import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/wallet';
import { ConnectionProvider } from './contexts/connection';
import { AccountsProvider } from './contexts/accounts';
import { MarketProvider } from './contexts/market';
import { ThemeProvider } from './contexts/ThemeContext';
import Layer from './pages/Layer';
import Faucet from './pages/Faucet';

const App: React.FC = () => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <AccountsProvider>
          <MarketProvider>
            <ThemeProvider>
              <Router>
                <div>
                  <Switch>
                    <Route path="/dashboard" component={Layer} />
                    <Route path="/faucet" exact component={Faucet} />
                  </Switch>
                </div>
              </Router>
            </ThemeProvider>
          </MarketProvider>
        </AccountsProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;

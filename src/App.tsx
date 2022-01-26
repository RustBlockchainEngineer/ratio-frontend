import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import * as dotenv from 'dotenv';
import { WalletProvider } from './contexts/wallet';
import { ConnectionProvider } from './contexts/connection';
import { AccountsProvider } from './contexts/accounts';
import { MarketProvider } from './contexts/market';
import { ThemeProvider } from './contexts/ThemeContext';
import Layer from './pages/Layer';
import Faucet from './pages/Faucet';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './contexts/auth';
import { RaydiumPoolProvider, SaberPoolProvider, MercurialPoolProvider, OrcaPoolProvider } from './contexts/pools';
import { PriceProvider } from './contexts/price';
import { MercurialAPIProvider } from './contexts/mercurialAPI';
import NotFound from './pages/NotFound';

dotenv.config();

const App: React.FC = () => {
  return (
    <ConnectionProvider>
      <AuthProvider>
        <WalletProvider>
          <AccountsProvider>
            <RaydiumPoolProvider>
              <SaberPoolProvider>
                <MercurialPoolProvider>
                  <OrcaPoolProvider>
                    <PriceProvider>
                      <MarketProvider>
                        <MercurialAPIProvider>
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
                                  <Route component={NotFound} />
                                </Switch>
                              </div>
                            </Router>
                          </ThemeProvider>
                        </MercurialAPIProvider>
                      </MarketProvider>
                    </PriceProvider>
                  </OrcaPoolProvider>
                </MercurialPoolProvider>
              </SaberPoolProvider>
            </RaydiumPoolProvider>
          </AccountsProvider>
        </WalletProvider>
      </AuthProvider>
    </ConnectionProvider>
  );
};

export default App;

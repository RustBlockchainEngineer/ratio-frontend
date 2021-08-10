import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/wallet'
import { ConnectionProvider } from './contexts/connection'
import { AccountsProvider } from './contexts/accounts'
import { MarketProvider } from './contexts/market'
import Layer from './pages/Layer'

const App: React.FC = () => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <AccountsProvider>
          <MarketProvider>
            <Router>
              <div>
                <Switch>
                  <Route path="/" component={Layer} />
                </Switch>
              </div>
            </Router>
          </MarketProvider>
        </AccountsProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App

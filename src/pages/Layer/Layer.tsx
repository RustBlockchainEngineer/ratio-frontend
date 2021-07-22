import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Switch, Route, Redirect } from 'react-router-dom'

import Navbar from '../../components/Navbar'
import AvailableVaults from '../AvailableVaults'
import ArchivedVaults from '../ArchivedVaults'
import ActiveVaults from '../ActiveVaults'
import InstaBuyLp from '../InstaBuyLP'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import VaultDashboard from '../VaultDashboard'

import { actionTypes, selectors } from '../../features/wallet'

const Layer = () => {
  const dispatch = useDispatch()
  const connectedWallet = useSelector(selectors.getConnectedStatus)
  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET })
  }

  return (
    <div className="layer">
      <Navbar
        onClickWalletBtn={onClickWalletBtn}
        connectedWallet={connectedWallet}
      />
      <div className="layer_container">
        <Header
          onClickWalletBtn={onClickWalletBtn}
          connectedWallet={connectedWallet}
        />
        <div>
          <Switch>
            <Route path="/available-vaults" component={AvailableVaults} exact />
            <Route path="/my-active-vaults" component={ActiveVaults} exact />
            <Route
              path="/my-archived-vaults"
              component={ArchivedVaults}
              exact
            />
            <Route path="/insta-buy-lp" component={InstaBuyLp} exact />
            <Route path="/vaultdashboard" component={VaultDashboard} exact />
            <Route exact path="/">
              <Redirect to="/available-vaults" />
            </Route>
          </Switch>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default Layer

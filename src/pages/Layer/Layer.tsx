import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import AvailableVaults from '../AvailableVaults'
import InstaBuyLp from '../InstaBuyLP'

const Layer = () => {
  return (
    <div className="layer">
      <Navbar />
      <div>
        <Switch>
          <Route path="/available-vaults" component={AvailableVaults} exact />
          <Route path="/insta-buy-lp" component={InstaBuyLp} exact />
          <Route exact path="/">
            <Redirect to="/available-vaults" />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default Layer

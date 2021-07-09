import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import AvailableVaults from '../AvailableVaults'
import InstaBuyLp from '../InstaBuyLP'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const Layer = () => {
  return (
    <div className="layer">
      <Navbar />
      <div className="layer_container">
        <Header />
        <div>
          <Switch>
            <Route path="/available-vaults" component={AvailableVaults} exact />
            <Route path="/insta-buy-lp" component={InstaBuyLp} exact />
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

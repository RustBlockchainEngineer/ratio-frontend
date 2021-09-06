import React from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { ThemeContext } from '../../contexts/ThemeContext';
import MobileMenuTrigger from '../../components/MobileMenuTrigger';
import Navbar from '../../components/Navbar';
import AvailableVaults from '../AvailableVaults';
import ArchivedVaults from '../ArchivedVaults';
import ActiveVaults from '../ActiveVaults';
import InstaBuyLp from '../InstaBuyLP';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VaultDashboard from '../VaultDashboard';

import { actionTypes } from '../../features/wallet';

// const isMobile = useMediaQuery({ maxWidth: 767 })

const Layer = () => {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDefault = useMediaQuery({ minWidth: 768 });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const dispatch = useDispatch();

  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET });
  };

  const clickMenuTrigger = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="layer" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="layer_container">
        <Header onClickWalletBtn={onClickWalletBtn} />

        <Navbar onClickWalletBtn={onClickWalletBtn} clickMenuItem={clickMenuTrigger} open={menuOpen} />

        {(isDefault || !menuOpen) && (
          <div>
            <Switch>
              <Route path="/available-vaults" component={AvailableVaults} exact />
              <Route path="/my-active-vaults" component={ActiveVaults} exact />
              <Route path="/my-archived-vaults" component={ArchivedVaults} exact />
              <Route path="/insta-buy-lp" component={InstaBuyLp} exact />
              <Route path="/vaultdashboard" component={VaultDashboard} exact />
              <Route exact path="/">
                <Redirect to="/available-vaults" />
              </Route>
            </Switch>
            <Footer />
          </div>
        )}
        {isMobile && <MobileMenuTrigger clickMenuTrigger={clickMenuTrigger} open={menuOpen} />}
      </div>
    </div>
  );
};

export default Layer;

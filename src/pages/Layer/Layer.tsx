import React from 'react';
import classNames from 'classnames';
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
  const [collapseFlag, setCollapseFlag] = React.useState(false);
  const dispatch = useDispatch();

  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET });
  };

  const clickMenuTrigger = () => {
    setMenuOpen(!menuOpen);
  };

  const onCollapseMenu = () => {
    setCollapseFlag(!collapseFlag);
  };

  return (
    <div className="layer" data-theme={darkMode ? 'dark' : 'light'}>
      <div className={classNames('layer_container', { 'layer_container--collapse': collapseFlag })}>
        <Header onClickWalletBtn={onClickWalletBtn} darkMode={darkMode} />

        <Navbar
          darkMode={darkMode}
          onClickWalletBtn={onClickWalletBtn}
          clickMenuItem={clickMenuTrigger}
          open={menuOpen}
          collapseFlag={collapseFlag}
          setCollapseFlag={onCollapseMenu}
        />

        {(isDefault || !menuOpen) && (
          <div>
            <Switch>
              <Route path="/dashboard/available-vaults" component={AvailableVaults} exact />
              <Route path="/dashboard/my-active-vaults" component={ActiveVaults} exact />
              <Route path="/dashboard/my-archived-vaults" component={ArchivedVaults} exact />
              <Route path="/dashboard/insta-buy-lp" component={InstaBuyLp} exact />
              <Route path="/dashboard/vaultdashboard" component={VaultDashboard} exact />
              <Route exact path="/dashboard">
                <Redirect to="/dashboard/available-vaults" />
              </Route>
            </Switch>
            <Footer darkMode={darkMode} />
          </div>
        )}
        {isMobile && <MobileMenuTrigger clickMenuTrigger={clickMenuTrigger} open={menuOpen} />}
      </div>
    </div>
  );
};

export default Layer;

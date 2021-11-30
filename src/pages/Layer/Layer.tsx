import React from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import useFetch from 'react-fetch-hook';
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
import CompareVaults from '../CompareVaults';

import { actionTypes } from '../../features/wallet';

import { getTokenBySymbol } from '../../utils/tokens';
import { getTokenIcon } from '../../utils/utils';
import { WRAPPED_SOL_MINT } from '../../utils/ids';
import { useConnectionConfig } from '../../contexts/connection';

// const isMobile = useMediaQuery({ maxWidth: 767 })

const tokens = [
  'So11111111111111111111111111111111111111112',
  'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
  'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
  '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
  'ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs',
];

const Layer = () => {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDefault = useMediaQuery({ minWidth: 768 });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [collapseFlag, setCollapseFlag] = React.useState(false);

  const { tokenMap } = useConnectionConfig();

  const { isLoading, data } = useFetch<any>('https://api.ratio.finance/api/whitelist');

  React.useEffect(() => {
    if (data?.length > 0) {
      dispatch({ type: actionTypes.SET_WHITELIST, payload: data });
    }
  }, [data]);

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
      {!isLoading && (
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
                <Route path="/dashboard/compareVaults" component={CompareVaults} exact />
                <Route exact path="/dashboard">
                  <Redirect to="/dashboard/available-vaults" />
                </Route>
              </Switch>
              <Footer darkMode={darkMode} />
            </div>
          )}
          {isMobile && <MobileMenuTrigger clickMenuTrigger={clickMenuTrigger} open={menuOpen} />}
        </div>
      )}
    </div>
  );
};

export default Layer;

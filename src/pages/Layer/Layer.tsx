import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import useFetch from 'react-fetch-hook';
import { useWallet } from '../../contexts/wallet';
import { ThemeContext } from '../../contexts/ThemeContext';
import MobileMenuTrigger from '../../components/MobileMenuTrigger';
import Navbar from '../../components/Navbar';
import AvailableVaults from '../AvailableVaults';
import ArchivedVaults from '../ArchivedVaults';
import ActiveVaults from '../ActiveVaults';
import InstaBuyLp from '../InstaBuyLP';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VaultSetup from '../VaultSetup';
import VaultDashboard from '../VaultDashboard';
import CompareVaults from '../CompareVaults';

import { actionTypes } from '../../features/wallet';
import { walletSelectors } from '../../features/wallet';
import logoside from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import telegram from '../../assets/images/telegram.svg';
import twitter from '../../assets/images/twitter.svg';
import medium from '../../assets/images/medium.svg';
import telegramDark from '../../assets/images/telegram-dark.svg';
import twitterDark from '../../assets/images/twitter-dark.svg';
import mediumDark from '../../assets/images/medium-dark.svg';

import { getTokenBySymbol } from '../../utils/tokens';
import { getTokenIcon } from '../../utils/utils';
import { WRAPPED_SOL_MINT } from '../../utils/ids';
import { useConnectionConfig } from '../../contexts/connection';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// const isMobile = useMediaQuery({ maxWidth: 767 })

const Layer = () => {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isDefault = useMediaQuery({ minWidth: 768 });
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [collapseFlag, setCollapseFlag] = React.useState(false);
  const whitelist_data = useSelector(walletSelectors.getWhiteListData);
  const { tokenMap } = useConnectionConfig();
  const history = useHistory();

  const { isLoading, data } = useFetch<any>('https://api.ratio.finance/api/whitelist');

  const [enable, setEnable] = React.useState(false);
  const { connected, publicKey } = useWallet();

  type whitelistProps = {
    id: number;
    address: any;
    created_at: string;
    updated_at: string;
    name: string;
  };

  React.useEffect(() => {
    if (data?.length > 0) {
      dispatch({ type: actionTypes.SET_WHITELIST, payload: data });
    }
  }, [data]);

  React.useEffect(() => {
    if (connected) {
      const filtered = whitelist_data.filter((item: whitelistProps) => {
        return item.address === publicKey?.toString();
      });
      if (filtered?.length > 0) {
        setEnable(true);
      } else {
        setEnable(false);
        toast('Please add your address to whitelist.');
      }
    } else {
      history.push('/dashboard');
    }
  }, [connected, publicKey]);

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

  if (isTabletOrMobile) {
    return (
      <div className="layer__mobile">
        <div>
          <img src={logoside} alt="logoside" />
          <p>Mobile site coming Soon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layer" data-theme={darkMode ? 'dark' : 'light'}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
      />
      {!isLoading && (
        <div
          className={classNames('layer_container', {
            'layer_container--collapse': collapseFlag,
          })}
        >
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
                <Route path="/dashboard/vaultsetup/:mint" component={VaultSetup} exact />
                <Route path="/dashboard/vaultdashboard/:mint" component={VaultDashboard} exact />
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

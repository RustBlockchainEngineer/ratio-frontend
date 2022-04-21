import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useWallet } from '../../contexts/wallet';
import { ThemeContext } from '../../contexts/ThemeContext';
import MobileMenuTrigger from '../../components/MobileMenuTrigger';
import Navbar from '../../components/Navbar';
import AllVaults from '../AllVaults';
import ArchivedVaults from '../ArchivedVaults';
import ActiveVaults from '../ActiveVaults';
import InstaBuyLp from '../InstaBuyLP';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VaultDashboard from '../VaultDashboard';
import VaultSetup from '../VaultSetup';
import CompareVaults from '../CompareVaults';
import FairdropPage from '../FairdropPage';

import { actionTypes } from '../../features/wallet';
import logoside from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import telegram from '../../assets/images/telegram.svg';
import twitter from '../../assets/images/twitter.svg';
import medium from '../../assets/images/medium.svg';
import telegramDark from '../../assets/images/telegram-dark.svg';
import twitterDark from '../../assets/images/twitter-dark.svg';
import mediumDark from '../../assets/images/medium-dark.svg';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_ENDPOINT } from '../../constants/constants';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import useFetch from 'react-fetch-hook';

const Layer = () => {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const isTabletOrMobile = useMediaQuery({ maxWidth: 991 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapseFlag, setCollapseFlag] = useState(false);
  const history = useHistory();
  const { connected, publicKey } = useWallet();
  const [enable, setEnable] = useState(false);
  const {
    isLoading: authFetchLoading,
    data: userAuthorized,
    error: authFetchError,
  } = useFetch<boolean | undefined>(`${API_ENDPOINT}/users/auth/${publicKey}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
    depends: [!!publicKey],
  });
  useEffect(() => {
    if (authFetchError) {
      toast.error('An error occured when fetching authorization');
      console.error(authFetchError.message);
    }
  }, [authFetchError]);
  useEffect(() => {
    if (connected) {
      if (authFetchLoading || authFetchError || userAuthorized === undefined) {
        setEnable(false);
        return;
      }
      const shouldEnable = !!userAuthorized;
      if (!shouldEnable) {
        toast('Please add your address to whitelist.');
      }
      setEnable(shouldEnable);
    } else {
      history.push('/dashboard');
    }
    return () => {
      setEnable(false);
    };
  }, [userAuthorized, authFetchError, authFetchLoading, publicKey, location.pathname]);

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

  console.log(connected);

  return (
    <div className="layer" data-theme={darkMode ? 'dark' : 'light'}>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        limit={2}
        pauseOnHover
      />
      {authFetchLoading && (
        <div className="text-center mt-5">
          <LoadingSpinner className="spinner-border-lg text-primary" />
        </div>
      )}
      {!authFetchLoading && (
        <div
          className={classNames('layer_container', {
            'layer_container--collapse': collapseFlag,
            'layer_container--empty': !enable || !connected,
          })}
        >
          <Header onClickWalletBtn={onClickWalletBtn} darkMode={darkMode} enable={enable} />
          {enable && connected ? (
            <>
              <Navbar
                darkMode={darkMode}
                onClickWalletBtn={onClickWalletBtn}
                clickMenuItem={clickMenuTrigger}
                open={menuOpen}
                collapseFlag={collapseFlag}
                setCollapseFlag={onCollapseMenu}
              />

              <div>
                <Switch>
                  <Route path="/dashboard/available-vaults" component={AllVaults} exact />
                  <Route path="/dashboard/active-vaults" component={ActiveVaults} exact />
                  <Route path="/dashboard/my-archived-vaults" component={ArchivedVaults} exact />
                  <Route path="/dashboard/insta-buy-lp" component={InstaBuyLp} exact />
                  <Route path="/dashboard/vaultdashboard/:mint" component={VaultDashboard} exact />
                  <Route path="/dashboard/vaultsetup/:mint" component={VaultSetup} exact />
                  <Route path="/dashboard/fairdrop" component={FairdropPage} exact />
                  <Route path="/dashboard/compareVaults" component={CompareVaults} exact />
                  <Route exact path="/dashboard">
                    <Redirect to="/dashboard/available-vaults" />
                  </Route>
                </Switch>
                <Footer darkMode={darkMode} />
              </div>
              {isTabletOrMobile && <MobileMenuTrigger clickMenuTrigger={clickMenuTrigger} open={menuOpen} />}
            </>
          ) : (
            <div className="layer__empty">
              <div className="text-center">
                <img src={darkMode ? darkLogo : logoside} alt="logoside" />
                <h4 className="mt-4">De-Risking Defi</h4>
                <h6 className="mt-4">Join our community</h6>
                <div className="layer__social mt-3">
                  <a target="_blank" href="https://t.me/ratiofinance" rel="noreferrer">
                    <img src={darkMode ? telegramDark : telegram} alt="telegram" />
                  </a>
                  <a target="_blank" href="https://twitter.com/ratiofinance" rel="noreferrer" className="ml-3">
                    <img src={darkMode ? twitterDark : twitter} alt="twitter" />
                  </a>
                  <a target="_blank" href="https://medium.com/@ratiofinance" rel="noreferrer" className="ml-3">
                    <img src={darkMode ? mediumDark : medium} alt="medium" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Layer;

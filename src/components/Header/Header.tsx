import React, { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { FaCheck } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import Button from '../Button';
import SwitchButton from '../SwitchButton';
// import NetworkSelector from '../NetworkSelector';

import { shortenAddress } from '../../utils/utils';
import { useLocalStorageState } from '../../utils/utils';
import { useWallet } from '../../contexts/wallet';
import { NavBarProgressBarTVL } from '../Navbar/NavBarProgressBarTVL';
import { NavBarProgressBarTotalUSDr } from '../Navbar/NavBarProgressBarTotalUSDr';
import { walletSelectors } from '../../features/wallet';
import GuideModal from '../GuideModal';

type HeaderProps = {
  onClickWalletBtn: () => void;
  darkMode: boolean;
  enable?: boolean;
};

// const isMobile = useMediaQuery({ maxWidth: 1024 });

// const isDefault = useMediaQuery({ minWidth: 1024 });

const Header = (headerProps: HeaderProps) => {
  const { onClickWalletBtn, enable } = headerProps;
  const { connected, connect, wallet } = useWallet();
  const network = useSelector(walletSelectors.getNetwork);
  const [hover, setHover] = React.useState(false);
  const history = useHistory();
  const isTabletOrMobile = useMediaQuery({ minWidth: 768, maxWidth: 1349 });
  const isDesktop = useMediaQuery({ minWidth: 1350 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [autoConnect, setAutoConnect] = useLocalStorageState('autoConnect');
  const [providerUrl, setProviderUrl] = useLocalStorageState('walletProvider');

  useEffect(() => {
    if (connected) {
      setHover(false);
    }
  }, [connected]);

  const onClickDisconnect = () => {
    wallet?.disconnect();
    console.log(autoConnect);
    console.log(providerUrl);
    setAutoConnect(null);
    setProviderUrl(null);
    window.location.reload();
  };

  const renderWalletConnection = () => {
    if (connected) {
      return (
        <div
          className="header__connected"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={onClickDisconnect}
        >
          <div className={classNames({ header__checked: !hover, header__closed: hover })}>
            {hover ? <IoMdCloseCircle /> : <FaCheck />}
          </div>
          {hover ? <h6>Disconnect</h6> : <h6>{shortenAddress(`${wallet?.publicKey}`)}</h6>}
        </div>
      );
    } else {
      return (
        <Button
          onClick={connected ? onClickWalletBtn : connect}
          // disabled={connected && disabled}
          className="button--blue walletBtn"
        >
          Connect Wallet
        </Button>
      );
    }
  };

  const renderTotalTVLCap = () => {
    return enable && connected ? (
      <div className="header__connected header__tvl">
        <NavBarProgressBarTVL className="header__progressbar" shouldDisplayLabel={false} />
      </div>
    ) : null;
  };

  const renderTotalUSDrDebt = () => {
    return enable && connected ? (
      <div className="header__connected header__debt">
        <NavBarProgressBarTotalUSDr className="header__progressbar" shouldDisplayLabel={false} />
      </div>
    ) : null;
  };

  console.log(network);

  return (
    <div className="header row ">
      {/* {isTable && <img src={darkMode ? darkLogo : logo} alt="logo" />} */}
      {isDesktop && (
        <>
          <div className="d-flex justify-content-end col-lg-auto col-md-auto ">
            {connected && network.value === 'devnet' && enable && <GuideModal />}
            {connected && network.value === 'devnet' && enable && (
              <Button disabled={!connected} className="button--blue walletBtn" onClick={() => history.push('/faucet')}>
                Faucet
              </Button>
            )}
          </div>
          {/* {connected && network.value === 'devnet' && <div className="header__gap" />} */}
          <div className="col-lg-auto col-md-auto ">{renderTotalUSDrDebt()}</div>
          <div className="col-lg-auto col-md-auto">{renderTotalTVLCap()}</div>
          {/* {connected && <div className="header__gap" />} */}
          <div className="d-flex justify-content-end col-lg-auto col-md-auto">
            <SwitchButton />
            {/* <NetworkSelector /> */}
            {renderWalletConnection()}
          </div>
        </>
      )}
      {isTabletOrMobile && (
        <>
          <div className="d-flex justify-content-end align-items-center w-100">
            <div className="d-flex justify-content-end col ">
              {connected && network.value === 'devnet' && enable && <GuideModal />}
              {connected && network.value === 'devnet' && enable && (
                <Button
                  disabled={!connected}
                  className="button--blue walletBtn"
                  onClick={() => history.push('/faucet')}
                >
                  Faucet
                </Button>
              )}
            </div>
            <div className="d-flex justify-content-end col-sm-auto">
              <SwitchButton />
              {/* <NetworkSelector /> */}
              {renderWalletConnection()}
            </div>
          </div>
          <div className="col-md-6 mt-4 pl-4 ">{renderTotalUSDrDebt()}</div>
          <div className="col-md-6 mt-4">{renderTotalTVLCap()}</div>
        </>
      )}
      {isMobile && (
        <>
          <div className="d-flex justify-content-end col-lg-auto">
            <SwitchButton />
            {/* <NetworkSelector /> */}
            {renderWalletConnection()}
          </div>
          <div className="d-flex justify-content-end col mt-3 ">
            {connected && network.value === 'devnet' && enable && <GuideModal />}
            {connected && network.value === 'devnet' && enable && (
              <Button disabled={!connected} className="button--blue walletBtn" onClick={() => history.push('/faucet')}>
                Faucet
              </Button>
            )}
          </div>
          <div className="col-md-6 mt-4 ">{renderTotalUSDrDebt()}</div>
          <div className="col-md-6 mt-4">{renderTotalTVLCap()}</div>
        </>
      )}
    </div>
  );
};

export default Header;

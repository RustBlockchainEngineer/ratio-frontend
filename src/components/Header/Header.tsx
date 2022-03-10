import React, { useEffect } from 'react';
import classNames from 'classnames';
import { FaCheck } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import Button from '../Button';
import SwitchButton from '../SwitchButton';

import { shortenAddress } from '../../utils/utils';
import { useWallet } from '../../contexts/wallet';
import { NavBarProgressBarTVL } from '../Navbar/NavBarProgressBarTVL';
import { NavBarProgressBarUSDr } from '../Navbar/NavBarProgressBarUSDr';

type HeaderProps = {
  onClickWalletBtn: () => void;
  darkMode: boolean;
};

const Header = (headerProps: HeaderProps) => {
  const { onClickWalletBtn } = headerProps;
  const { connected, connect, wallet } = useWallet();
  const [hover, setHover] = React.useState(false);

  useEffect(() => {
    if (connected) {
      setHover(false);
    }
  }, [connected]);

  const renderWalletConnection = () => {
    if (connected) {
      return (
        <div
          className="header__connected"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => wallet?.disconnect()}
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
    return connected ? (
      <div className="header__connected header__tvl">
        <NavBarProgressBarTVL className="header__progressbar" shouldDisplayLabel={false} />
      </div>
    ) : null;
  };

  const renderTotalUSDrDebt = () => {
    return connected ? (
      <div className="header__connected header__debt">
        <NavBarProgressBarUSDr className="header__progressbar" shouldDisplayLabel={false} />
      </div>
    ) : null;
  };

  return (
    <div className="header d-flex">
      {/* {isTable && <img src={darkMode ? darkLogo : logo} alt="logo" />} */}
      {/* {connected && <GuideModal />}
      {connected && (
        <Button disabled={!connected} className="button--blue walletBtn mr-3" onClick={() => history.push('/faucet')}>
          Faucet
        </Button>
      )} */}
      <SwitchButton />
      {renderTotalUSDrDebt()}
      {renderTotalTVLCap()}
      {connected && <div className="header__gap" />}
      {renderWalletConnection()}
    </div>
  );
};

export default Header;

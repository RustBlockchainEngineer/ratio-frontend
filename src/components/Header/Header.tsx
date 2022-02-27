import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { FaCheck } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import Button from '../Button';
import SwitchButton from '../SwitchButton';
import GuideModal from '../GuideModal';

import { shortenAddress } from '../../utils/utils';
import { useWallet } from '../../contexts/wallet';

import logo from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import { useConnection } from '../../contexts/connection';

type HeaderProps = {
  onClickWalletBtn: () => void;
  darkMode: boolean;
};

const Header = ({ onClickWalletBtn, darkMode }: HeaderProps) => {
  const history = useHistory();
  const { connected, connect, wallet } = useWallet();
  const connection = useConnection();
  const [hover, setHover] = React.useState(false);
  // const { onClick, children, disabled, allowWalletChange, ...rest } = props

  const isTable = useMediaQuery({ minWidth: 990, maxWidth: 1280 });

  useEffect(() => {
    if (connected) {
      setHover(false);
    }
  }, [connected]);

  return (
    <div className="header d-flex">
      {/* {isTable && <img src={darkMode ? darkLogo : logo} alt="logo" />} */}
      {connected && <GuideModal />}
      {connected && (
        <Button disabled={!connected} className="button--blue walletBtn mr-3" onClick={() => history.push('/faucet')}>
          Faucet
        </Button>
      )}
      <SwitchButton />
      {connected ? (
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
      ) : (
        <Button
          onClick={connected ? onClickWalletBtn : connect}
          // disabled={connected && disabled}
          className="button--blue walletBtn"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default Header;

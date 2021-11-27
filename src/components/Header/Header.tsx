import React from 'react';
import { useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { FaCheck } from 'react-icons/fa';
import Button from '../Button';
import SwitchButton from '../SwitchButton';
import { shortenAddress } from '../../utils/utils';
import { useWallet } from '../../contexts/wallet';
import logo from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';

type HeaderProps = {
  onClickWalletBtn: () => void;
  darkMode: boolean;
};

const Header = ({ onClickWalletBtn, darkMode }: HeaderProps) => {
  const history = useHistory();
  const { connected, connect, wallet } = useWallet();
  // const { onClick, children, disabled, allowWalletChange, ...rest } = props

  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="header d-flex">
      {isMobile && <img src={darkMode ? darkLogo : logo} alt="logo" />}
      <button className="header__faucet button--fill" onClick={() => history.push('/faucet')}>
        Faucet
      </button>
      <SwitchButton />
      {connected ? (
        <div className="header__connected">
          <div className="header__checked">
            <FaCheck />
          </div>
          <h6>{shortenAddress(`${wallet?.publicKey}`)}</h6>
        </div>
      ) : (
        <Button
          onClick={connected ? onClickWalletBtn : connect}
          // disabled={connected && disabled}
          className="button--fill walletBtn"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default Header;

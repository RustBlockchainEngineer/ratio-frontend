import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import NavbarItem from './NavbarItem';
import Button from '../Button';
import logo from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import availableVaultsIcon from '../../assets/images/available-vaults-icon.svg';
import instaBuyIcon from '../../assets/images/insta-buy-icon.svg';
import activeVaultsIcon from '../../assets/images/active-vaults-icon.svg';
import archivedVaultsIcon from '../../assets/images/archived-vaults-icon.svg';

type NavbarProps = {
  onClickWalletBtn: () => void;
  clickMenuItem: () => void;
  open: boolean;
  darkMode: boolean;
};

const Navbar = ({ onClickWalletBtn, clickMenuItem, open, darkMode }: NavbarProps) => {
  const isDefault = useMediaQuery({ minWidth: 768 });
  const location = useLocation();
  const history = useHistory();
  const [navIndex, setNavIndex] = useState(location.pathname);
  const { connected, connect } = useWallet();

  React.useEffect(() => {
    setNavIndex(location.pathname);
  }, [location.pathname]);

  const onItemClick = (index: string) => {
    setNavIndex(index);
    history.push(`${index}`);
    clickMenuItem();
  };

  return (
    <div className={classNames('navbar-vertical', { closed: open })}>
      {isDefault && <img src={darkMode ? darkLogo : logo} alt="logo" />}
      <div className="mt-md-5">
        <NavbarItem
          icon={availableVaultsIcon}
          name="Available Vaults"
          active={navIndex === '/dashboard/available-vaults'}
          navIndex="/dashboard/available-vaults"
          onItemClick={onItemClick}
        />
        <NavbarItem
          icon={activeVaultsIcon}
          name="My Active Vaults"
          active={navIndex === '/dashboard/my-active-vaults'}
          navIndex="/dashboard/my-active-vaults"
          onItemClick={onItemClick}
        />
        <NavbarItem
          icon={archivedVaultsIcon}
          name="My Archived Vaults"
          active={navIndex === '/dashboard/my-archived-vaults'}
          navIndex="/dashboard/my-archived-vaults"
          onItemClick={onItemClick}
        />
        <NavbarItem
          icon={instaBuyIcon}
          name="Insta-buy LP"
          active={navIndex === '/dashboard/insta-buy-lp'}
          navIndex="/dashboard/insta-buy-lp"
          onItemClick={onItemClick}
        />
      </div>
      <div>
        {connected ? (
          <div className="navbar-vertical__connectedBox">
            <hr />
            <div className="navbar-vertical__item">
              <h6>Active Vaults</h6>
              <div>0</div>
            </div>
            <div className="navbar-vertical__item">
              <h6>Total Vault Value</h6>
              <div>0</div>
            </div>
            <div className="navbar-vertical__item">
              <h6>USDr Minted</h6>
              <div>0</div>
            </div>
          </div>
        ) : (
          <Button onClick={connected ? onClickWalletBtn : connect} className="button--fill walletBtn">
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
};

export default Navbar;

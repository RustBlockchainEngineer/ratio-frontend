import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import NavbarItem from './NavbarItem';
import Button from '../Button';
import logo from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import collapseLogo from '../../assets/images/image-logo.svg';
import availableVaultsIcon from '../../assets/images/available-vaults-icon.svg';
import instaBuyIcon from '../../assets/images/insta-buy-icon.svg';
import activeVaultsIcon from '../../assets/images/active-vaults-icon.svg';
import archivedVaultsIcon from '../../assets/images/archived-vaults-icon.svg';
import { RiMenuFoldLine } from 'react-icons/ri';
import { IoWalletOutline } from 'react-icons/io5';

type NavbarProps = {
  onClickWalletBtn: () => void;
  clickMenuItem: () => void;
  setCollapseFlag: () => void;
  open: boolean;
  darkMode: boolean;
  collapseFlag: boolean;
};

const Navbar = ({ onClickWalletBtn, clickMenuItem, open, darkMode, collapseFlag, setCollapseFlag }: NavbarProps) => {
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
    <div className={classNames('navbar-vertical', { 'navbar-vertical--collapse': collapseFlag }, { closed: open })}>
      {isDefault && <img src={collapseFlag ? collapseLogo : darkMode ? darkLogo : logo} alt="logo" />}
      <div className="mt-md-5">
        <NavbarItem
          icon={availableVaultsIcon}
          name="Available Vaults"
          active={navIndex === '/dashboard/available-vaults'}
          navIndex="/dashboard/available-vaults"
          onItemClick={onItemClick}
          collapseFlag={collapseFlag}
        />
        {/* <NavbarItem
          icon={activeVaultsIcon}
          name="My Active Vaults"
          active={navIndex === '/dashboard/my-active-vaults'}
          navIndex="/dashboard/my-active-vaults"
          onItemClick={onItemClick}
          collapseFlag={collapseFlag}
        /> */}
        {/* <NavbarItem
          icon={archivedVaultsIcon}
          name="My Archived Vaults"
          active={navIndex === '/dashboard/my-archived-vaults'}
          navIndex="/dashboard/my-archived-vaults"
          onItemClick={onItemClick}
        /> */}
        {/* <NavbarItem
          icon={instaBuyIcon}
          name="Insta-buy LP"
          active={navIndex === '/dashboard/insta-buy-lp'}
          navIndex="/dashboard/insta-buy-lp"
          onItemClick={onItemClick}
        /> */}
      </div>
      <div>
        {connected ? (
          !collapseFlag ? (
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
          ) : null
        ) : (
          <Button
            onClick={connected ? onClickWalletBtn : connect}
            className={classNames('button--fill walletBtn', { 'walletBtn--collapse': collapseFlag })}
          >
            {!collapseFlag ? <div>Connect Wallet</div> : <IoWalletOutline size={30} />}
          </Button>
        )}
      </div>
      <div className="navbar-vertical__collapsemenu" onClick={setCollapseFlag}>
        <RiMenuFoldLine size={25} color="#4c646f" />
        {!collapseFlag && <p>Collapse Menu</p>}
      </div>
    </div>
  );
};

export default Navbar;

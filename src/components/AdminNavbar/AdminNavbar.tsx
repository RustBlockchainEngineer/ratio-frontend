import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import NavbarItem from '../NavbarItem';
import Button from '../Button';
import logo from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import collapseLogo from '../../assets/images/image-logo.svg';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { IoWalletOutline } from 'react-icons/io5';
import { useAuthContextProvider } from '../../contexts/authAPI';

type NavbarProps = {
  clickMenuItem: () => void;
  setCollapseFlag: () => void;
  open: boolean;
  darkMode: boolean;
  collapseFlag: boolean;
};

const AdminNavbar = ({ clickMenuItem, open, darkMode, collapseFlag, setCollapseFlag }: NavbarProps) => {
  const location = useLocation();
  const history = useHistory();
  const [navIndex, setNavIndex] = useState(location.pathname);
  const { connected, connect } = useWallet();
  const { user } = useAuthContextProvider();

  useEffect(() => {
    setNavIndex(location.pathname);
  }, [location.pathname]);

  const onItemClick = (index: string) => {
    setNavIndex(index);
    history.push(`${index}`);
    clickMenuItem();
  };

  return (
    user && (
      <div className={classNames('navbar-vertical', { 'navbar-vertical--collapse': collapseFlag }, { closed: open })}>
        <img
          src={collapseFlag ? collapseLogo : darkMode ? darkLogo : logo}
          alt="logo"
          className="mt-md-0 ml-md-0 mt-4 ml-4"
        />
        <div className="mt-4">
          <NavbarItem
            name="Whitelist"
            active={navIndex === '/adminpanel/whitelist'}
            navIndex="/adminpanel/whitelist"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
          />
          <NavbarItem
            name="Global params"
            active={navIndex === '/adminpanel/globalparams'}
            navIndex="/adminpanel/globalparams"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
          />
          <NavbarItem
            name="Fees"
            active={navIndex === '/adminpanel/fees'}
            navIndex="/adminpanel/fees"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
          />
          <NavbarItem
            name="Collateralization ratios"
            active={navIndex === '/adminpanel/collateralizationratios'}
            navIndex="/adminpanel/collateralizationratios"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
          />
          <NavbarItem
            name="Vaults"
            active={navIndex === '/adminpanel/vaults'}
            navIndex="/adminpanel/vaults"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
          />
          <NavbarItem
            name="Admin tasks"
            active={navIndex === '/adminpanel/tasks'}
            navIndex="/adminpanel/tasks"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
          />
          <NavbarItem
            name="Tokens"
            active={navIndex === '/adminpanel/tokens'}
            navIndex="/adminpanel/tokens"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
          />
        </div>
        <div>
          {!connected && (
            <Button
              onClick={connect}
              className={classNames('button--fill walletBtn', { 'walletBtn--collapse': collapseFlag })}
            >
              {!collapseFlag ? <div>Connect Wallet</div> : <IoWalletOutline size={30} />}
            </Button>
          )}
        </div>
        <div className="navbar-vertical__collapsemenu" onClick={setCollapseFlag}>
          {!collapseFlag ? (
            <RiMenuFoldLine size={25} color="#4c646f" />
          ) : (
            <RiMenuUnfoldLine size={25} color="#4c646f" />
          )}
          {!collapseFlag && <p>Collapse Menu</p>}
        </div>
      </div>
    )
  );
};

export default AdminNavbar;

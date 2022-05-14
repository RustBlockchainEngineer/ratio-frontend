import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import NavbarItem from './../NavbarItem/NavbarItem';
import Button from '../Button';
import logo from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import collapseLogo from '../../assets/images/image-logo.svg';
import allVaultsIcon from '../../assets/images/all-vaults-icon.svg';
import activeVaultsIcon from '../../assets/images/active-vaults-icon.svg';
import fairdropIcon from '../../assets/images/fairdrop.svg';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { IoWalletOutline } from 'react-icons/io5';
import { TokenAmount } from '../../utils/safe-math';
import { selectors } from '../../features/dashboard';
import { LPair } from '../../types/VaultTypes';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { useAllVaultInfo, useUserOverview } from '../../contexts/state';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

type NavbarProps = {
  onClickWalletBtn: () => void;
  clickMenuItem: () => void;
  setCollapseFlag: () => void;
  open: boolean;
  darkMode: boolean;
  collapseFlag: boolean;
};

const Navbar = ({ onClickWalletBtn, clickMenuItem, open, darkMode, collapseFlag, setCollapseFlag }: NavbarProps) => {
  const location = useLocation();
  const history = useHistory();
  const [navIndex, setNavIndex] = useState(location.pathname);
  const { connected, connect } = useWallet();
  const userOverview = useUserOverview();

  const activeVaultCount = userOverview ? userOverview.activeVaults.toString() : '0';
  const totalMinted = Number(new TokenAmount(userOverview ? userOverview.totalDebt : 0, USDR_MINT_DECIMALS).fixed());

  const totalLocked = Number(new TokenAmount(userOverview ? userOverview.tvlUsd : 0, USDR_MINT_DECIMALS).fixed());
  const [activeVaultsData, setActiveVaultsData] = useState([]);
  const userVaultInfos = useAllVaultInfo();

  const { vaults: all_vaults } = useVaultsContextProvider();
  const active_vaults = useSelector(selectors.getActiveVaults);

  React.useEffect(() => {
    setNavIndex(location.pathname);
  }, [location.pathname]);

  const getActiveVaultInfo = async function (activeVaults: any[]) {
    const vaults = Object.values(activeVaults);

    const avdArr: any = [];
    for (const vault of vaults) {
      const { mint, debt, collPrice: price }: any = vault;
      console.log(price);
      const pv = +new TokenAmount((vault as any)?.tvlUsd ?? 0, USDR_MINT_DECIMALS).fixed();
      // const pv = price * Number(new TokenAmount(lockedAmount as string, mintInfo.decimals).fixed());
      const title = all_vaults?.find((vault: LPair) => vault.address_id === mint)?.symbol;
      const vaultValue: any = {
        title,
        mint,
        pv,
        debt: new TokenAmount(debt, USDR_MINT_DECIMALS).fixed(),
      };
      avdArr.push(vaultValue);
    }
    return {
      activeVaults: avdArr,
    };
  };

  React.useEffect(() => {
    if (userVaultInfos) {
      getActiveVaultInfo(userVaultInfos).then((res) => {
        setActiveVaultsData(res.activeVaults);
      });
    }
  }, [userVaultInfos]);

  const onItemClick = (index: string) => {
    setNavIndex(index);
    history.push(`${index}`);
    clickMenuItem();
  };

  return (
    <div className={classNames('navbar-vertical', { 'navbar-vertical--collapse': collapseFlag }, { closed: open })}>
      <img
        src={collapseFlag ? collapseLogo : darkMode ? darkLogo : logo}
        alt="logo"
        className="mt-md-0 ml-md-0 mt-4 ml-4"
      />
      <div className="mt-4">
        <NavbarItem
          icon={allVaultsIcon}
          name="Available Vaults"
          active={navIndex === '/dashboard/available-vaults'}
          navIndex="/dashboard/available-vaults"
          onItemClick={onItemClick}
          collapseFlag={collapseFlag}
        />
        <NavbarItem
          icon={activeVaultsIcon}
          name="My Active Vaults"
          active={navIndex === '/dashboard/active-vaults'}
          navIndex="/dashboard/active-vaults"
          onItemClick={onItemClick}
          collapseFlag={collapseFlag}
          expands={true}
          expandData={active_vaults}
          positionValues={activeVaultsData}
        />
        <NavbarItem
          icon={fairdropIcon}
          name="RATIO Fairdrop"
          active={navIndex === '/dashboard/fairdrop'}
          navIndex="/dashboard/fairdrop"
          onItemClick={onItemClick}
          collapseFlag={collapseFlag}
        />
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
                <h6 className="navbar-vertical__item--yellow">{activeVaultCount && parseInt(activeVaultCount)}</h6>
              </div>
              <div className="navbar-vertical__item">
                <h6>Total Vault Value</h6>
                <h6 className="navbar-vertical__item--yellow">
                  $ {totalLocked.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h6>
              </div>
              <div className="navbar-vertical__item pt-3">
                <h6>USDr Minted</h6>
                <h6 className="navbar-vertical__item--green">{(Math.ceil(totalMinted * 100) / 100).toFixed(2)}</h6>
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
        {!collapseFlag ? <RiMenuFoldLine size={25} color="#4c646f" /> : <RiMenuUnfoldLine size={25} color="#4c646f" />}
        {!collapseFlag && <p>Collapse Menu</p>}
      </div>
    </div>
  );
};

export default Navbar;

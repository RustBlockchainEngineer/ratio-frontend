import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import NavbarItem from './../NavbarItem/NavbarItem';
import { NavbarProgressBar, ProgressBarType } from './NavbarProgressBar';
import Button from '../Button';
import logo from '../../assets/images/logo-side.svg';
import darkLogo from '../../assets/images/dark-logoside.svg';
import collapseLogo from '../../assets/images/image-logo.svg';
import allVaultsIcon from '../../assets/images/all-vaults-icon.svg';
import activeVaultsIcon from '../../assets/images/active-vaults-icon.svg';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { IoWalletOutline } from 'react-icons/io5';
import { useUpdateState } from '../../contexts/auth';
import { useConnection } from '../../contexts/connection';
import { getUserOverview, USDR_MINT_KEY } from '../../utils/ratio-lending';
import { useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { sleep } from '../../utils/utils';
import { usePrices } from '../../contexts/price';
import { actionTypes, selectors } from '../../features/dashboard';
import { LPair } from '../../types/VaultTypes';
import { useVaultsContextProvider } from '../../contexts/vaults';

type NavbarProps = {
  onClickWalletBtn: () => void;
  clickMenuItem: () => void;
  setCollapseFlag: () => void;
  open: boolean;
  darkMode: boolean;
  collapseFlag: boolean;
};

const Navbar = ({ onClickWalletBtn, clickMenuItem, open, darkMode, collapseFlag, setCollapseFlag }: NavbarProps) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const [navIndex, setNavIndex] = useState(location.pathname);
  const { connected, connect, wallet } = useWallet();
  const connection = useConnection();

  const [activeVaultCount, setActiveVaultCount] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalLocked, setTotalLocked] = useState(0);
  const [overviewData, setOverviewData] = useState('{}');
  const [activeVaultsData, setActiveVaultsData] = useState([]);
  const usdrMint = useMint(USDR_MINT_KEY);
  const prices = usePrices();

  const { vaults: all_vaults } = useVaultsContextProvider();
  const mints = useMemo(() => all_vaults?.map((item: LPair) => item.address_id) || [], [all_vaults]);
  const active_vaults = useSelector(selectors.getActiveVaults);
  const overview = useSelector(selectors.getOverview);

  React.useEffect(() => {
    setNavIndex(location.pathname);
  }, [location.pathname]);

  const { updateStateFlag } = useUpdateState();

  const showOverview = async (mints: any[]) => {
    const overview = await getUserOverview(connection, wallet, mints);
    dispatch({ type: actionTypes.SET_OVERVIEW, payload: overview });
    setOverviewData(JSON.stringify(overview));
  };

  const getUpdateOverview = async (mints: any[]) => {
    const originOverviewData = overviewData;
    let newOverviewData = '';
    do {
      await sleep(300);
      const overview = await getUserOverview(connection, wallet, mints);
      newOverviewData = JSON.stringify(overview);
    } while (newOverviewData !== originOverviewData);
    setOverviewData(newOverviewData);
  };

  React.useEffect(() => {
    const overview = JSON.parse(overviewData);
    if (Object.keys(overview).length) {
      const { totalDebt, activeVaults, vaultCount } = overview;
      setTotalMinted(Number(new TokenAmount(totalDebt, usdrMint?.decimals).fixed()));
      setActiveVaultCount(vaultCount);

      let tmpTotalValueLocked = 0;
      const vaults = Object.values(activeVaults);

      const avdArr: any = [];
      for (const vault of vaults) {
        const { mint, lockedAmount, debt }: any = vault;
        const price = prices[mint] ? prices[mint] : Number(process.env.REACT_APP_LP_TOKEN_PRICE);
        const pv = price * Number(new TokenAmount(lockedAmount as string, 9).fixed());
        const title = all_vaults?.find((vault: LPair) => vault.address_id === mint)?.symbol;
        const vaultValue: any = {
          title,
          mint,
          pv,
          debt: new TokenAmount(debt, usdrMint?.decimals).fixed(),
        };
        avdArr.push(vaultValue);
        tmpTotalValueLocked += pv;
      }
      setActiveVaultsData(avdArr);
      setTotalLocked(tmpTotalValueLocked);
    }

    return () => {
      setActiveVaultsData([]);
      setTotalLocked(0);
    };
  }, [overviewData]);

  React.useEffect(() => {
    if (connected && wallet?.publicKey && usdrMint) {
      if (updateStateFlag === false) {
        showOverview(mints);
      } else {
        getUpdateOverview(mints);
      }
    }
  }, [connected, wallet, usdrMint, updateStateFlag, prices, mints]);

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
        {
          <NavbarItem
            icon={activeVaultsIcon}
            name="My Active Vaults"
            active={navIndex === '/dashboard/active-vaults'}
            navIndex="/dashboard/active-vaults"
            onItemClick={onItemClick}
            collapseFlag={collapseFlag}
            expands={false}
            expandData={active_vaults}
            positionValues={activeVaultsData}
          />
        }
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
                <h6 className="navbar-vertical__item--yellow">{activeVaultCount}</h6>
              </div>
              <div className="navbar-vertical__item">
                <h6>Total Vault Value</h6>
                <h6 className="navbar-vertical__item--yellow">$ {totalLocked.toFixed(2)}</h6>
              </div>
              <div className="navbar-vertical__item pb-3">
                <h6>USDr Minted</h6>
                <h6 className="navbar-vertical__item--green">{(Math.ceil(totalMinted * 100) / 100).toFixed(2)}</h6>
              </div>
              <hr className="ratio-platform mt-3" />
              <NavbarProgressBar type={ProgressBarType.TVL} />
              <NavbarProgressBar type={ProgressBarType.USDr} />
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
function setOverview(overview: { activeVaults: any; totalDebt: number; vaultCount: number }): any {
  throw new Error('Function not implemented.');
}

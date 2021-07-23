import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import NavbarItem from './NavbarItem'
import Button from '../Button'
import logo from '../../assets/images/logo-side.svg'
import availableVaultsIcon from '../../assets/images/available-vaults-icon.svg'
import instaBuyIcon from '../../assets/images/insta-buy-icon.svg'
import activeVaultsIcon from '../../assets/images/active-vaults-icon.svg'
import archivedVaultsIcon from '../../assets/images/archived-vaults-icon.svg'

type NavbarProps = {
  onClickWalletBtn: () => void
  connectedWallet: boolean
}

const Navbar = ({ onClickWalletBtn, connectedWallet }: NavbarProps) => {
  const location = useLocation()
  const history = useHistory()
  const [navIndex, setNavIndex] = useState(location.pathname)

  React.useEffect(() => {
    setNavIndex(location.pathname)
  }, [location.pathname])

  const onItemClick = (index: string) => {
    setNavIndex(index)
    history.push(`${index}`)
  }

  return (
    <div className="navbar-vertical">
      <img src={logo} alt="logo" />
      <div className="mt-5">
        <NavbarItem
          icon={availableVaultsIcon}
          name="Available Vaults"
          active={navIndex === '/available-vaults'}
          navIndex="/available-vaults"
          onItemClick={onItemClick}
        />
        <NavbarItem
          icon={activeVaultsIcon}
          name="My Active Vaults"
          active={navIndex === '/my-active-vaults'}
          navIndex="/my-active-vaults"
          onItemClick={onItemClick}
        />
        <NavbarItem
          icon={archivedVaultsIcon}
          name="My Archived Vaults"
          active={navIndex === '/my-archived-vaults'}
          navIndex="/my-archived-vaults"
          onItemClick={onItemClick}
        />
        <NavbarItem
          icon={instaBuyIcon}
          name="Insta-buy LP"
          active={navIndex === '/insta-buy-lp'}
          navIndex="/insta-buy-lp"
          onItemClick={onItemClick}
        />
      </div>
      <div>
        {connectedWallet ? (
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
          <Button className="button--fill walletBtn" onClick={onClickWalletBtn}>
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  )
}

export default Navbar

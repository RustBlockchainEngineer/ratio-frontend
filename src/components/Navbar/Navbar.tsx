import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import NavbarItem from './NavbarItem'
import logo from '../../assets/images/logo-side.svg'
import availableVaultsIcon from '../../assets/images/available-vaults-icon.svg'
import instaBuyIcon from '../../assets/images/insta-buy-icon.svg'

interface NavbarProps {
  history: any
}

const Navbar = ({ history }: NavbarProps) => {
  const [navIndex, setNavIndex] = useState('available-vaults')

  const onItemClick = (index: string) => {
    setNavIndex(index)
    history.push(`/${index}`)
  }

  return (
    <div className="navbar-vertical">
      <img src={logo} alt="logo" />
      <div className="mt-5">
        <NavbarItem
          icon={availableVaultsIcon}
          name="Available Vaults"
          active={navIndex === 'available-vaults'}
          navIndex="available-vaults"
          onItemClick={onItemClick}
        />
        <NavbarItem
          icon={instaBuyIcon}
          name="Insta-buy LP"
          active={navIndex === 'insta-buy-lp'}
          navIndex="insta-buy-lp"
          onItemClick={onItemClick}
        />
      </div>
    </div>
  )
}

export default withRouter(Navbar)

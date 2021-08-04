import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { FaCheck } from 'react-icons/fa'
import Button from '../Button'
import logo from '../../assets/images/logo-side.svg'

type HeaderProps = {
  onClickWalletBtn: () => void
  connectedWallet: boolean
}

const Header = ({ onClickWalletBtn, connectedWallet }: HeaderProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 })
  return (
    <div className="header d-flex ">
      {isMobile && <img src={logo} alt="logo" />}
      {connectedWallet ? (
        <div className="header__connected">
          <div className="header__checked">
            <FaCheck />
          </div>
          <h6>0x6a…85ba</h6>
        </div>
      ) : (
        <Button className="button--fill walletBtn" onClick={onClickWalletBtn}>
          Connect Wallet
        </Button>
      )}
    </div>
  )
}

export default Header

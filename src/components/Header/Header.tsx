import React from 'react'
import { FaCheck } from 'react-icons/fa'
import Button from '../Button'

type HeaderProps = {
  onClickWalletBtn: () => void
  connectedWallet: boolean
}

const Header = ({ onClickWalletBtn, connectedWallet }: HeaderProps) => {
  return (
    <div className="header d-flex justify-content-end">
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

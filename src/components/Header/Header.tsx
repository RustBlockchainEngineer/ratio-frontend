import React from 'react'
import { useMediaQuery } from 'react-responsive'
import { FaCheck } from 'react-icons/fa'
import Button from '../Button'
import { shortenAddress } from '../../utils/utils'
import { useWallet } from '../../contexts/wallet'
import logo from '../../assets/images/logo-side.svg'

type HeaderProps = {
  onClickWalletBtn: () => void
}

const Header = ({ onClickWalletBtn }: HeaderProps) => {
  const { connected, connect, wallet } = useWallet()
  // const { onClick, children, disabled, allowWalletChange, ...rest } = props

  const isMobile = useMediaQuery({ maxWidth: 767 })

  return (
    <div className="header d-flex ">
      {isMobile && <img src={logo} alt="logo" />}
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
  )
}

export default Header

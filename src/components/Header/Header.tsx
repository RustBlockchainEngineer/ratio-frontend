import React from 'react'

import Button from '../Button'

const Header = () => {
  return (
    <div className="header d-flex justify-content-end">
      <Button className="button--fill walletBtn">Connect Wallet</Button>
    </div>
  )
}

export default Header

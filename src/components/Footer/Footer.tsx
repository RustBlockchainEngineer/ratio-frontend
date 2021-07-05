import React from 'react'
import { Link } from 'react-router-dom'
import imageLogo from '../../assets/images/image-logo.svg'
import telegram from '../../assets/images/telegram.svg'
import twitter from '../../assets/images/twitter.svg'
import medium from '../../assets/images/medium.svg'

const Footer = () => {
  return (
    <div className="footer">
      <div className="d-flex justify-content-between">
        <img src={imageLogo} alt="imageLogo" />
        <div className="d-flex">
          <Link to="/">
            <img src={telegram} alt="telegram" />
          </Link>
          <Link to="/">
            <img src={twitter} alt="twitter" />
          </Link>
          <Link to="/">
            <img src={medium} alt="medium" />
          </Link>
        </div>
      </div>
      <div className="mt-4 d-flex justify-content-between">
        <h6>
          Copyright © 2021. Ratio Protocol.
          <br /> All rights reserved.
        </h6>
        <ul className="list-group list-group-horizontal">
          <li className="list-group-item">
            <Link to="/">Whitepaper</Link>
          </li>
          <li className="list-group-item">
            <Link to="/">Terms & Conditions</Link>
          </li>
          <li className="list-group-item">
            <Link to="/">Privacy Policy</Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Footer

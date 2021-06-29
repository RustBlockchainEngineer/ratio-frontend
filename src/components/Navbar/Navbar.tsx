import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className="navbar-vertical">
      <h4>Ratio</h4>
      <ul>
        <li>
          <Link to="/available-vaults">Available Vaults</Link>
        </li>
        <li>
          <Link to="/insta-buy-lp">Insta-buy LP</Link>
        </li>
      </ul>
    </div>
  )
}

export default Navbar

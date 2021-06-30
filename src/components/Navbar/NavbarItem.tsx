import React from 'react'
import classNames from 'classnames'

interface NavbarItemProps {
  icon: string
  name: string
  active: boolean
  navIndex: string
  onItemClick: (navIndex: string) => void
}

const NavbarItem = ({
  icon,
  name,
  active,
  navIndex,
  onItemClick,
}: NavbarItemProps) => {
  return (
    <div
      className={classNames(
        'navbarItem d-flex align-items-center px-5 py-4',
        active ? 'navbarItem--active' : ''
      )}
      onClick={() => onItemClick(navIndex)}
      onKeyDown={() => onItemClick(navIndex)}
      aria-hidden="true"
    >
      <img src={icon} alt="icon" />
      <p className="ml-3">{name}</p>
    </div>
  )
}

export default NavbarItem

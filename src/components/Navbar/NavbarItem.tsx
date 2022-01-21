import React, { useState } from 'react';
import classNames from 'classnames';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

type NavbarItemProps = {
  icon: string;
  name: string;
  active: boolean;
  navIndex: string;
  collapseFlag: boolean;
  onItemClick: (navIndex: string) => void;
  expands?: boolean;
};

const NavbarItem = ({ icon, name, active, navIndex, collapseFlag, expands, onItemClick }: NavbarItemProps) => {
  const [expandStatus, setExpandStatus] = useState(false);

  return (
    <div
      className={classNames(
        'navbarItem d-flex align-items-center justify-content-between pl-5 pr-4 py-4',
        active ? 'navbarItem--active' : ''
      )}
      onClick={() => onItemClick(navIndex)}
      onKeyDown={() => onItemClick(navIndex)}
      aria-hidden="true"
    >
      <div className="d-flex align-items-center">
        <img src={icon} alt="icon" />
        {!collapseFlag && <p className="ml-3">{name}</p>}
      </div>
      {expands && (
        <div>
          {expandStatus ? (
            <IoIosArrowUp onClick={() => setExpandStatus(!expandStatus)} />
          ) : (
            <IoIosArrowDown onClick={() => setExpandStatus(!expandStatus)} />
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarItem;

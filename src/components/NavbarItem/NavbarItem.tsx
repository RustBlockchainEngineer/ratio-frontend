import React, { useState } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { nFormatter } from '../../utils/utils';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

type NavbarItemProps = {
  icon?: string;
  name: string;
  active: boolean;
  navIndex: string;
  collapseFlag: boolean;
  onItemClick: (navIndex: string) => void;
  expands?: boolean;
  expandData?: [];
  positionValues?: any;
};

const NavbarItem = (navBarItemProps: NavbarItemProps) => {
  const { icon, name, active, navIndex, collapseFlag, expands, positionValues, onItemClick } = navBarItemProps;

  const [expandStatus, setExpandStatus] = useState(false);

  const changeExpandStatus = (e: any) => {
    e.stopPropagation();
    setExpandStatus(!expandStatus);
  };

  return (
    <div className={classNames('navbarItem', active ? 'navbarItem--active' : '')}>
      <div
        className="d-flex align-items-center justify-content-between pl-4 pr-4 py-4"
        onClick={() => onItemClick(navIndex)}
        onKeyDown={() => onItemClick(navIndex)}
        aria-hidden="true"
      >
        <div className="d-flex align-items-center">
          {icon && <img src={icon} alt="icon" />}
          {!collapseFlag && <p className="ml-3">{name}</p>}
        </div>
        {expands && !collapseFlag && positionValues.length > 0 && (
          <div>
            {expandStatus ? (
              <IoIosArrowUp onClick={changeExpandStatus} />
            ) : (
              <IoIosArrowDown onClick={changeExpandStatus} />
            )}
          </div>
        )}
      </div>
      <div className="navbar-active-vaults">
        {expandStatus &&
          !collapseFlag &&
          positionValues &&
          positionValues.map((item: any, index: number) => {
            return (
              <div className="row navbarItem__expand no-gutters" key={index}>
                <div className="text-left">
                  <Link to={`/dashboard/vaultdashboard/${item.mint}`} className="navbarItem__expand-name">
                    {item.title}
                  </Link>
                </div>
                <div className="d-flex">
                  <div>
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 100, hide: 100 }}
                      overlay={<Tooltip id="tooltip">Position Value</Tooltip>}
                    >
                      <div className="navbarItem__expand-positionvalue">$ {item && nFormatter(item.pv || 0, 2)}</div>
                    </OverlayTrigger>
                  </div>
                  <div>
                    <OverlayTrigger
                      placement="top"
                      delay={{ show: 100, hide: 100 }}
                      overlay={<Tooltip id="tooltip">USDr minted</Tooltip>}
                    >
                      <div className="navbarItem__expand-rewardsearned">$ {nFormatter(item.debt || 0, 1)}</div>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default NavbarItem;

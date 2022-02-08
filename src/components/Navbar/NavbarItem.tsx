import React, { useState } from 'react';
import classNames from 'classnames';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { nFormatter } from '../../utils/utils';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

type NavbarItemProps = {
  icon: string;
  name: string;
  active: boolean;
  navIndex: string;
  collapseFlag: boolean;
  onItemClick: (navIndex: string) => void;
  expands?: boolean;
  expandData?: [];
  positionValues?: any;
};

const NavbarItem = ({
  icon,
  name,
  active,
  navIndex,
  collapseFlag,
  expands,
  expandData,
  positionValues,
  onItemClick,
}: NavbarItemProps) => {
  const [expandStatus, setExpandStatus] = useState(false);

  const changeExpandStatus = (e: any) => {
    e.stopPropagation();
    setExpandStatus(!expandStatus);
  };

  return (
    <div className={classNames('navbarItem', active ? 'navbarItem--active' : '')}>
      <div
        className="d-flex align-items-center justify-content-between pl-5 pr-4 py-4"
        onClick={() => onItemClick(navIndex)}
        onKeyDown={() => onItemClick(navIndex)}
        aria-hidden="true"
      >
        <div className="d-flex align-items-center">
          <img src={icon} alt="icon" />
          {!collapseFlag && <p className="ml-3">{name}</p>}
        </div>
        {expands && !collapseFlag && (
          <div>
            {expandStatus ? (
              <IoIosArrowUp onClick={changeExpandStatus} />
            ) : (
              <IoIosArrowDown onClick={changeExpandStatus} />
            )}
          </div>
        )}
      </div>
      <div className="container navbar-active-vaults">
        {expandStatus &&
          !collapseFlag &&
          positionValues &&
          positionValues.map((item: any, index: number) => {
            return (
              <div className="row navbarItem__expand no-gutters" key={index}>
                <div className="text-left col-6">
                  <p className="navbarItem__expand-name">{item.title}</p>
                </div>
                <div className="col-3">
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 100, hide: 100 }}
                    overlay={<Tooltip id="tooltip">Position Value</Tooltip>}
                  >
                    <div className="navbarItem__expand-positionvalue">$ {item && nFormatter(item.pv || 0, 2)}</div>
                  </OverlayTrigger>
                </div>
                <div className="col-3">
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 100, hide: 100 }}
                    overlay={<Tooltip id="tooltip">USDr minted</Tooltip>}
                  >
                    <div className="navbarItem__expand-rewardsearned">$ {nFormatter(item.debt || 0, 2)}</div>
                  </OverlayTrigger>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default NavbarItem;

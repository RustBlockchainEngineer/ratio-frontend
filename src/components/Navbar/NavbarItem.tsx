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
      {expandStatus && expandData && (
        <div>
          {expandData.map((item: any, index: number) => {
            return (
              <div className="navbarItem__expand" key={index}>
                <p className="navbarItem__expand-name">{item.title}</p>
                <div className="d-flex">
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 100, hide: 100 }}
                    overlay={<Tooltip id="tooltip">Position Value</Tooltip>}
                  >
                    <div className="navbarItem__expand-positionvalue">
                      $ {positionValues && nFormatter(positionValues.find((i: any) => i.mint === item.mint).pv, 2)}
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 100, hide: 100 }}
                    overlay={<Tooltip id="tooltip">Rewards earned</Tooltip>}
                  >
                    <div className="navbarItem__expand-rewardsearned">$ {nFormatter(200000000000, 2)}</div>
                  </OverlayTrigger>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NavbarItem;

import React, { useState } from 'react';
import classNames from 'classnames';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { over } from 'lodash-es';
import { formatUSD } from '../../utils/utils';

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
  console.log(positionValues);
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
            console.log(positionValues[`${item.mint}`]);
            return (
              <div className="navbarItem__expand" key={index}>
                <p className="navbarItem__expand-name">{item.title}</p>
                <div className="navbarItem__expand-positionvalue">
                  {positionValues && formatUSD.format(positionValues.find((i: any) => i.mint === item.mint).pv)}
                </div>
                <div className="navbarItem__expand-rewardsearned">$2,700</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NavbarItem;

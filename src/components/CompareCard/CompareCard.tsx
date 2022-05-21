import React from 'react';
import classNames from 'classnames';
import { PairType } from '../../types/VaultTypes';
import { getRiskLevel } from '../../utils/helper';
import RayIcon from '../../assets/images/RAY.svg';

type CompareCardProps = {
  label: string;
  list: Array<PairType>;
  type: string;
};

const CompareCard = ({ label, list, type }: CompareCardProps) => {
  console.log(list);
  return (
    <div className="col col-4">
      <div className="compareCard ">
        <h3>{label}</h3>
        {list.map((vault: PairType, index: number) => {
          return (
            <div className={classNames('compareCard__list', { 'compareCard__list--odd': index % 2 === 0 })} key={index}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <h5>{index + 1}</h5>
                  {/* <img src={vault.icons[0]} alt="icon" className="compareCard__list--icon1" />
                  <img src={vault.icons[1]} alt="icon" className="compareCard__list--icon2" /> */}
                  <h6>{vault?.title}</h6>
                </div>
                {type === 'TVL' && <h5>{vault?.tvl}</h5>}
                {type === 'APY' && <h5>{vault?.apr}%</h5>}
                {type === 'RISK' && (
                  <h5 className={getRiskLevel(Number(vault.risk))}>{getRiskLevel(Number(vault.risk))}</h5>
                )}
              </div>
              <div className="compareCard__list__platform">
                <p>Platform</p>
                <div className="d-flex align-items-center">
                  <img src={RayIcon} alt="icon" className="compareCard__list--icon1" />
                  <p>RADIUM</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompareCard;

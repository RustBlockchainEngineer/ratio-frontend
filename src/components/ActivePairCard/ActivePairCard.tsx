import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { getRiskLevel } from '../../libs/helper';
// import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import Button from '../Button';
// import riskLevel from '../../assets/images/risklevel.svg';
import highRisk from '../../assets/images/highrisk.svg';
import RayIcon from '../../assets/images/RAY.svg';
import USDrIcon from '../../assets/images/USDr.png';

type PairType = {
  id: number;
  icons: Array<string>;
  title: string;
  tvl: string;
  risk: number;
  apr: number;
  owed: string;
  mint: string;
  price: string;
  warning?: boolean;
};

interface ActiveCardProps {
  data: PairType;
}

const ActivePairCard = ({ data }: ActiveCardProps) => {
  const [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <div className="col col-xl-4 col-lg-6 col-md-12">
        <div
          className={classNames('activepaircard mt-4', {
            'activepaircard--warning': data.warning,
          })}
        >
          <div className="activepaircard__header">
            <div className="d-flex">
              <div>
                <img src={data.icons[0]} alt={data.icons[0].toString()} />
                <img src={data.icons[1]} alt={data.icons[1].toString()} className="activepaircard__header-icon" />
              </div>
              <div
                className={classNames('activepaircard__titleBox', {
                  'activepaircard__titleBox--warning': data.warning,
                })}
              >
                <h6>{data.title}</h6>
                <p>{data.tvl}</p>
              </div>
            </div>
            <div className="activepaircard__riskBox">
              <div className="d-flex">
                <p>Risk Level:</p>
                {/* <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip id="risk-tooltip">
                      The risk is a financial formula comprised of the weight,
                      standard deviations and covariances of the underlying
                      assets in the LP pair.
                    </Tooltip>
                  }
                >
                  <img src={riskLevel} alt="lisklevel" className="ml-2" />
                </OverlayTrigger> */}
              </div>
              <div className="d-flex justify-content-start align-items-center mt-1">
                {getRiskLevel(data.risk) === 'EXTREME' && <img src={highRisk} alt="highRisk" />}
                <h6 className={classNames('ml-1', getRiskLevel(data.risk))}>{getRiskLevel(data.risk)} </h6>
              </div>
            </div>
          </div>
          <div className="activepaircard__aprBox">
            <div className="d-flex justify-content-between">
              <h6>APR:</h6>
              <h6 className="semiBold">{data.apr}%</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Owed:</h6>
              <h6 className="semiBold">{data.owed}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Available to Mint:</h6>
              <h6 className="semiBold">{data.mint}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>Liquidation Price:</h6>
              <h6 className="semiBold">{data.price}</h6>
            </div>
          </div>
          <div className="activepaircard__btnBox d-flex">
            <div className="col">
              <Button className="button--gradientBorder lp-button">Deposit LP</Button>
            </div>
            <div className="col">
              <Button className="button--fill lp-button">Enter Vault</Button>
            </div>
          </div>
          {data.warning ? (
            <div className="activepaircard__warningBox">
              <div>
                <IoWarningOutline size={27} />
              </div>
              <p>
                <strong>WARNING:</strong> You are approaching your liquidation threshold of <strong>$90.</strong>
              </p>
            </div>
          ) : (
            <div className="activepaircard__warningBox" />
          )}
          <div className="activepaircard__detailBox">
            {isOpen && (
              <div className="activepaircard__detailBox__content">
                <div className="d-flex justify-content-between">
                  <div>
                    Position value:
                    <p>$16,200</p>
                    <div className="activepaircard__detailBox__content--tokens">
                      <img src={RayIcon} alt="RayIcon" />
                      RAY: $4200
                    </div>
                    <div className="activepaircard__detailBox__content--tokens">
                      <img src={USDrIcon} alt="USDrIcon" />
                      USDr: $6400
                    </div>
                  </div>
                  <div className="text-right">
                    Rewards earned:
                    <p>$2,700</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Button className="button--fill lp-button">Harvest</Button>
                </div>
              </div>
            )}

            <div className="activepaircard__detailBox__toggle" onClick={() => setOpen(!isOpen)} aria-hidden="true">
              Position Overview {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivePairCard;

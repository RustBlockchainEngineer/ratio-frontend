import React from 'react';
import { Link } from 'react-router-dom';
// import { useSelector } from 'react-redux'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import LockVaultModal from '../LockVaultModal';
import DisclaimerModal from '../DisclaimerModal';
import Button from '../Button';
// import riskLevel from '../../assets/images/risklevel.svg';
import highRisk from '../../assets/images/highrisk.svg';

// import { selectors } from '../../features/wallet'

type PairType = {
  id: number;
  icons: Array<string>;
  title: string;
  tvl: string;
  risk: number;
  apr: number;
  details: string;
};

interface TokenPairCardProps {
  data: PairType;
}

const TokenPairCard = ({ data }: TokenPairCardProps) => {
  const [isOpen, setOpen] = React.useState(false);
  // const connectedWallet = useSelector(selectors.getConnectedStatus)
  const { connected } = useWallet();

  const renderModalButton = () => {
    if (data.risk >= 200 && data.risk < 250) return <DisclaimerModal data={data} />;
    return <LockVaultModal data={data} />;
  };

  return (
    <>
      <div className="col col-xl-4 col-lg-6 col-md-12">
        <div className="tokenpaircard mt-4">
          <div className="tokenpaircard__header">
            <div className="d-flex">
              <div>
                <img src={data.icons[0]} alt={data.icons[0].toString()} />
                <img src={data.icons[1]} alt={data.icons[1].toString()} className="tokenpaircard__header-icon" />
              </div>
              <div className="tokenpaircard__titleBox">
                <h6>{data.title}</h6>
                <p>{data.tvl}</p>
              </div>
            </div>
            <div className="tokenpaircard__riskBox">
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
              <div className="d-flex justify-content-end align-items-center mt-1">
                {data.risk > 80 && <img src={highRisk} alt="highRisk" />}
                <h6 className={classNames('ml-1', data.risk > 80 ? 'high' : 'medium')}>{data.risk} %</h6>
              </div>
            </div>
          </div>
          <div className="tokenpaircard__aprBox">
            <h6>APR:</h6>
            <h6 className="semiBold">{data.apr}%</h6>
          </div>
          <div className="tokenpaircard__btnBox d-flex">
            <div className="col">
              <Link to="/insta-buy-lp">
                <Button className="button--gradientBorder insta-buy-lp">Insta-buy Lp</Button>
              </Link>
            </div>
            <div className="col">
              {connected ? (
                renderModalButton()
              ) : (
                <OverlayTrigger
                  placement="top"
                  trigger="click"
                  delay={{ show: 250, hide: 400 }}
                  overlay={<Tooltip id="tooltip">Connect your wallet to unlock this.</Tooltip>}
                >
                  <div>
                    <Button className="button--disabled generate">Mint USDr</Button>
                  </div>
                </OverlayTrigger>
              )}
            </div>
          </div>
          <div className="tokenpaircard__detailBox">
            {isOpen && (
              <div className="tokenpaircard__detailBox__content">
                <div className="d-flex justify-content-between">
                  <div>
                    Position value:
                    <p>$16,200</p>
                    <div className="tokenpaircard__detailBox__content--tokens">
                      <img src={data.icons[0]} alt="RayIcon" />
                      RAY: $4200
                    </div>
                    <div className="tokenpaircard__detailBox__content--tokens">
                      <img src={data.icons[1]} alt="USDrIcon" />
                      USDr: $6400
                    </div>
                  </div>
                  <div className="text-right">
                    Rewards earned:
                    <p>$2,700</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Button className="button--fill insta-buy-lp">Harvest</Button>
                </div>
              </div>
            )}

            <div className="tokenpaircard__detailBox__toggle" onClick={() => setOpen(!isOpen)} aria-hidden="true">
              Position Overview {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenPairCard;

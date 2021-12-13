import React from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getRiskLevel } from '../../libs/helper';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { useWallet } from '../../contexts/wallet';
import LockVaultModal from '../LockVaultModal';
import DisclaimerModal from '../DisclaimerModal';
import Button from '../Button';
import highRisk from '../../assets/images/highrisk.svg';
import { selectors } from '../../features/dashboard';
import { TokenPairCardProps } from '../../models/UInterface';

const TokenPairCard = ({ data, onCompareVault }: TokenPairCardProps) => {
  const history = useHistory();
  const [isOpen, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const { connected } = useWallet();

  const compare_valuts_status = useSelector(selectors.getCompareVaultsStatus);
  const renderModalButton = () => {
    if (data.risk === 250) return <DisclaimerModal data={data} />;
    return <LockVaultModal data={data} />;
  };

  const handleChangeComparison = (e: any) => {
    setChecked(e.target.checked);
    onCompareVault(data, e.target.checked);
  };

  const showDashboard = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
    }
  };

  return (
    <>
      <div className="col col-xl-4 col-lg-6 col-md-12">
        <div className="tokenpaircard mt-4">
          <div className="tokenpaircard__header">
            <div className="d-flex">
              <div>
                <img src={data.icon1} alt={'Token1'} />
                <img src={data.icon2} alt={'Token2'} className="tokenpaircard__header-icon" />
              </div>
              <div className="tokenpaircard__titleBox">
                <div onClick={showDashboard}>
                  <h6>{data.title}</h6>
                </div>
                <p>{data.tvl}</p>
              </div>
            </div>
            <div className="tokenpaircard__riskBox">
              <div className="text-right">
                <p>Risk Level</p>
                <h6 className={classNames('ml-1', getRiskLevel(data.risk))}>{getRiskLevel(data.risk)} </h6>
              </div>
            </div>
          </div>
          <div className="tokenpaircard__aprBox">
            <h6>APR:</h6>
            <h6 className="semiBold">{data.apr}%</h6>
          </div>
          {compare_valuts_status ? (
            <div className={classNames('tokenpaircard__btnBox', { 'tokenpaircard__btnBox--checked': checked })}>
              <label>
                <input type="checkbox" className="filled-in" checked={checked} onChange={handleChangeComparison} />
                <span>Compare this vault</span>
              </label>
            </div>
          ) : (
            <div className="tokenpaircard__btnBox d-flex">
              {/* <div className="col">
                <Link to="/insta-buy-lp">
                  <Button className="button--gradientBorder insta-buy-lp">Insta-buy LP</Button>
                </Link>
              </div> */}
              <div className="col">{renderModalButton()}</div>
            </div>
          )}

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
                    <p>$0</p>
                  </div>
                </div>
                {/* <div className="mt-3">
                  <Button className="button--fill insta-buy-lp">Harvest</Button>
                </div> */}
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

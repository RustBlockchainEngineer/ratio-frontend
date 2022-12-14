import React from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';

import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { selectors } from '../../features/dashboard';
import { TokenPairCardProps } from '../../types/VaultTypes';
import { formatUSD } from '../../utils/utils';

import smallRatioIcon from '../../assets/images/smallRatio.svg';
import { IoAlertCircleOutline } from 'react-icons/io5';
import linkIcon from '../../assets/images/link.svg';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { useLoadingState, usePoolInfo } from '../../contexts/state';
import { useGetPoolManager } from '../../hooks/useGetPoolManager';
import { ProgressBarVaultUSDr } from '../Navbar/ProgressBarVaultUSDr';
import USDrIcon from '../../assets/images/USDr.svg';
import infoIcon from '../../assets/images/risklevel.svg';

const TokenPairCard = (tokenPairCardProps: TokenPairCardProps) => {
  const { data, onCompareVault } = tokenPairCardProps;
  const history = useHistory();
  const compare_vaults_status = useSelector(selectors.getCompareVaultsStatus);
  const { connected } = useWallet();

  const [checked, setChecked] = React.useState(false);

  const hasUserReachedDebtLimit = false;
  const poolInfo = usePoolInfo(data.mint);
  const poolManager = useGetPoolManager(data.item);
  const loadingState = useLoadingState();

  const renderModalButton = (status: boolean) => {
    if (loadingState) {
      return (
        <Button disabled className="button button--blue tokenpaircard__generate mt-2">
          <LoadingSpinner className="spinner-border-sm text-dark" />
        </Button>
      );
    }
    return (
      <div className="col">
        <div className="d-flex">
          {status ? (
            <Button
              disabled={!connected}
              className="button button--blue tokenpaircard__generate mt-2"
              onClick={showDashboard}
            >
              Enter Vault
            </Button>
          ) : (
            <Button
              disabled={!connected}
              className="button button--blue tokenpaircard__generate mt-2"
              onClick={onClickDeposit}
            >
              Deposit
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleChangeComparison = (e: any) => {
    setChecked(e.target.checked);
    onCompareVault(data, e.target.checked);
  };

  const onClickDeposit = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultsetup/${data.mint}`);
    }
  };

  const showDashboard = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
    }
  };

  const printTvl = () => {
    if (isNaN(data.tvl) || data.tvl === 0) {
      return <LoadingSpinner className="spinner-border-sm text-info" />;
    }
    return formatUSD.format(data.tvl);
  };

  const printApy = () => {
    if (isNaN(data?.apr)) {
      return <LoadingSpinner className="spinner-border-sm text-info" />;
    }
    return Number(data?.apr).toFixed(2) + '%';
  };

  const isSinglePool = () => {
    return data.platform.symbol === 'Saber';
  };

  return (
    <>
      <div className="col-xxl-4 col-md-6 col-sm-12">
        <div
          className={classNames('tokenpaircard mt-4', {
            'tokenpaircard--warning': hasUserReachedDebtLimit,
          })}
        >
          <div className="tokenpaircard__header h-20">
            <div className="d-flex align-items-start">
              <img src={data.icon} alt={'Token1'} className="tokenpaircard__header-icon" />{' '}
              <div className="tokenpaircard__titleBox">
                <div>
                  <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                </div>
                <p>TVL {printTvl()}</p>
              </div>
            </div>
            {!loadingState && data.activeStatus && <div className="tokenpaircard__header--activeSticker">??? Active</div>}
          </div>
          <div className="tokenpaircard__aprBox h-48">
            <div className="flex justify-between items-center">
              <h6>Platform:</h6>
              <a href={poolManager.getLpLink(data.title)} target="_blank" rel="noreferrer">
                <div className="d-flex align-items-center mt-1 position-relative">
                  <img src={data.platform.icon} />
                  <h6 className="semiBold ml-1 tokenpaircard__aprBox--platformName">{data.platform.name}</h6>
                  <img src={linkIcon} alt="linkIcon" className="tokenpaircard__aprBox--linkIcon" />
                </div>
              </a>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <h6>APR:</h6>

              <div className="d-flex">
                <h6 className="semiBold">{Number(data?.apr + data?.ratioAPY).toFixed(2)}%</h6>
                {data.ratioAPY !== 0 && (
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 100, hide: 100 }}
                    overlay={
                      <Tooltip id="tooltip">
                        <div className="tokenpaircard__overlaytooltip">
                          <p>
                            <strong>APR</strong> is made up of:
                          </p>
                          <div className="mb-2 flex">
                            <img src={USDrIcon} alt="USDrIcon" /> Mint APR: {Number(data?.ratioAPY).toFixed(2)}%
                          </div>
                          {isSinglePool() && (
                            <div className="flex">
                              <img src={USDrIcon} alt="USDrIcon" /> Yield Farming: {printApy()}
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    }
                  >
                    <div className="tokenpaircard__overlaytrigger">
                      <img src={infoIcon} alt="infoIcon" />
                    </div>
                  </OverlayTrigger>
                )}
              </div>
            </div>

            <div className={classNames('d-flex justify-content-between mt-2')}>
              <h6>Collateralization Ratio:</h6>
              <h6 className="semiBold">{(100 / poolInfo?.ratio).toFixed(2)}%</h6>
            </div>
            {isSinglePool() && (
              <div className="d-flex justify-content-between align-items-center mt-2 tokenpaircard__riskBox">
                <div className="d-flex align-items-center">
                  <img src={smallRatioIcon} alt="smallRatio" />
                  <p className="mx-1">Risk Rating:</p>
                  {/* <img src={liskLevelIcon} alt="lisklevel" /> */}
                </div>
                <h6 className={classNames('ml-1 semiBold', data.risk)}>{data.risk} </h6>
              </div>
            )}
            <ProgressBarVaultUSDr mint={data.mint} className={classNames('activepaircard__usdrDebtbar mt-2')} />
            {/* <div>
              <h5>Platform:</h5>
              <a href={data.platform.link} target="_blank" rel="noreferrer">
                <div className="d-flex align-items-center mt-1 position-relative">
                  <img src={data.platform.icon} />
                  <h6 className="semiBold ml-1 tokenpaircard__aprBox--platformName">{data.platform.name}</h6>
                  <img src={linkIcon} alt="linkIcon" className="tokenpaircard__aprBox--linkIcon" />
                </div>
              </a>
            </div>
            <div>
              <h5>APY:</h5>
              <h6 className="semiBold mt-1">{Number(data?.apr).toFixed(2)}%</h6>
            </div> */}
          </div>
          {compare_vaults_status ? (
            <div className={classNames('tokenpaircard__btnBox', { 'tokenpaircard__btnBox--checked': checked })}>
              <label>
                <input type="checkbox" className="filled-in" checked={checked} onChange={handleChangeComparison} />
                <span>Compare this vault</span>
              </label>
            </div>
          ) : (
            <div className="tokenpaircard__btnBox d-flex">{renderModalButton(data.activeStatus)}</div>
          )}
          {
            /* TODO: fix this */ hasUserReachedDebtLimit && (
              <div className="tokenpaircard__warningBox">
                <div>
                  <IoAlertCircleOutline size={23} />
                </div>
                <p>
                  <strong>USDr Limit Reached:</strong> {hasUserReachedDebtLimit}
                </p>
              </div>
            )
          }
        </div>
      </div>
    </>
  );
};

export default TokenPairCard;

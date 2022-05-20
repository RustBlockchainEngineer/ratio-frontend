import React from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';

import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { selectors } from '../../features/dashboard';
import { TokenPairCardProps } from '../../models/UInterface';
import { formatUSD } from '../../utils/utils';

import smallRatioIcon from '../../assets/images/smallRatio.svg';
import { IoAlertCircleOutline } from 'react-icons/io5';
import linkIcon from '../../assets/images/link.svg';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { usePoolInfo } from '../../contexts/state';
import { getSaberLpLink } from '../../libs/helper';

const TokenPairCard = (tokenPairCardProps: TokenPairCardProps) => {
  const { data, onCompareVault } = tokenPairCardProps;
  const history = useHistory();

  const compare_vaults_status = useSelector(selectors.getCompareVaultsStatus);
  const { connected } = useWallet();

  const [checked, setChecked] = React.useState(false);

  const hasUserReachedDebtLimit = false;
  const poolInfo = usePoolInfo(data.mint);

  const renderModalButton = (status: boolean) => {
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
    if (isNaN(data?.apr) || data?.apr === 0) {
      return <LoadingSpinner className="spinner-border-sm text-info" />;
    }
    return Number(data?.apr).toFixed(2) + '%';
  };

  return (
    <>
      <div className="col-xxl-4 col-md-6 col-sm-12">
        <div
          className={classNames('tokenpaircard mt-4', {
            'tokenpaircard--warning': hasUserReachedDebtLimit,
          })}
        >
          <div className="tokenpaircard__header">
            <div className="d-flex align-items-start">
              <img src={data.icon} alt={'Token1'} className="tokenpaircard__header-icon" />{' '}
              <div className="tokenpaircard__titleBox">
                <div>
                  <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                </div>
                <p>TVL {printTvl()}</p>
              </div>
            </div>
            {data.activeStatus && <div className="tokenpaircard__header--activeSticker">● Active</div>}
          </div>
          <div className="tokenpaircard__aprBox">
            <div className="d-flex justify-content-between align-items-center">
              <h6>Platform</h6>
              <a href={getSaberLpLink(data.title)} target="_blank" rel="noreferrer">
                <div className="d-flex align-items-center mt-1 position-relative">
                  <img src={data.platform.icon} />
                  <h6 className="semiBold ml-1 tokenpaircard__aprBox--platformName">{data.platform.name}</h6>
                  <img src={linkIcon} alt="linkIcon" className="tokenpaircard__aprBox--linkIcon" />
                </div>
              </a>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h6>APY</h6>
              <h6 className="semiBold">{printApy()}</h6>
            </div>
            <div className="mt-2 d-flex justify-content-between">
              <h6>Collateralization Ratio:</h6>
              <h6 className="semiBold">{(100 / poolInfo.ratio).toFixed(2)}%</h6>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2 tokenpaircard__riskBox">
              <div className="d-flex align-items-center">
                <img src={smallRatioIcon} alt="smallRatio" />
                <p className="mx-1">Risk Rating</p>
                {/* <img src={liskLevelIcon} alt="lisklevel" /> */}
              </div>
              <h6 className={classNames('ml-1 semiBold', data.risk)}>{data.risk} </h6>
            </div>
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
            <div className="tokenpaircard__btnBox d-flex">
              {connected ? (
                renderModalButton(data.activeStatus)
              ) : (
                <OverlayTrigger
                  placement="top"
                  trigger="click"
                  delay={{ show: 250, hide: 400 }}
                  overlay={<Tooltip id="tooltip">Connect your wallet to unlock this.</Tooltip>}
                >
                  <div className="col">
                    <Button className="button--disabled generate mt-2">Open Vault</Button>
                  </div>
                </OverlayTrigger>
              )}
            </div>
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

import React from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import { TokenPairCardProps } from '../../types/VaultTypes';
import { formatUSD } from '../../utils/utils';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { usePoolInfo } from '../../contexts/state';
import { useWallet } from '../../contexts/wallet';
import { useGetPoolManager } from '../../hooks/useGetPoolManager';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import Button from '../Button';

import linkIcon from '../../assets/images/link.svg';
import infoIcon from '../../assets/images/risklevel.svg';
import USDrIcon from '../../assets/images/USDr.svg';

const TokenPairListItem = (tokenPairCardProps: TokenPairCardProps) => {
  const { data } = tokenPairCardProps;
  const history = useHistory();

  const { connected } = useWallet();

  const hasUserReachedDebtLimit = false;
  const poolInfo = usePoolInfo(data.mint);
  const poolManager = useGetPoolManager(data.item);

  const showDashboard = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
    }
  };

  const renderModalButton = (status: boolean) => {
    return (
      <div>
        <div className="mx-1"></div>
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
    );
  };

  const onClickDeposit = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultsetup/${data.mint}`);
    }
  };

  const printTvl = () => {
    if (isNaN(data.tvl)) {
      return <LoadingSpinner className="spinner-border-sm text-info" />;
    }
    return formatUSD.format(data.tvl);
  };

  return (
    <>
      <tr>
        <td scope="row">
          <div>
            <div className="d-flex align-items-start">
              <div className="d-flex">
                <img src={data.icon} alt={'Token1'} className="allvaults__table__icon" />
                {/* <img src={data.icons[0]} alt={data.icons[0].toString()} className="activepaircard__header-icon0" />
                <img src={data.icons[1]} alt={data.icons[1].toString()} className="activepaircard__header-icon1" /> */}
              </div>
              <div className={classNames('activepaircard__titleBox')}>
                <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                <p>TVL {printTvl()}</p>
              </div>
            </div>
          </div>
          {hasUserReachedDebtLimit && (
            <div className="tokenpaircard__table__warningBox">
              <div>
                <IoAlertCircleOutline size={20} />
              </div>
              <p>
                <strong>USDr Limit Reached:</strong> {hasUserReachedDebtLimit}
              </p>
            </div>
          )}
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h5>{data?.activeStatus && 'Active'}</h5>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td d-flex">
            <h6 className="semiBold">{Number(data?.apr).toFixed(2)}%</h6>
            <OverlayTrigger
              placement="top"
              delay={{ show: 100, hide: 100 }}
              overlay={
                <Tooltip id="tooltip">
                  <div className="tokenpaircard__overlaytooltip">
                    <p>
                      <strong>APR</strong> is made up of:
                    </p>
                    <div className="mb-1">
                      <img src={USDrIcon} alt="USDrIcon" /> Ratio APR: 45%
                    </div>
                    <div>
                      <img src={USDrIcon} alt="USDrIcon" /> Yield Farming: 80%
                    </div>
                  </div>
                </Tooltip>
              }
            >
              <div className="tokenpaircard__overlaytrigger">
                <img src={infoIcon} alt="infoIcon" />
              </div>
            </OverlayTrigger>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{(100 / poolInfo.ratio).toFixed(2)}%</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <a href={poolManager.getLpLink(data.title)} target="_blank" rel="noreferrer">
              <div className="d-inline-flex align-items-center mt-1 position-relative">
                <img src={data.platform.icon} />
                <p className="semiBold ml-1">{data.platform.name}</p>
                <img src={linkIcon} alt="linkIcon" className="activepaircard__titleBox--linkIcon" />
              </div>
            </a>
          </div>
        </td>
        <td>
          <div className="d-flex justify-content-between align-items-start">
            <div className="tokenpaircard__table__td">
              <h6 className={classNames('ml-2 mt-1', data.risk)}>{data.risk} </h6>
            </div>
          </div>
        </td>
        <td className="text-right">
          <div className="tokenpaircard__table__td">{renderModalButton(data.activeStatus)}</div>
        </td>
      </tr>
    </>
  );
};

export default TokenPairListItem;

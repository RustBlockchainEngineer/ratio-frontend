import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import { useConnection } from '../../contexts/connection';
import { formatUSD } from '../../utils/utils';

import { TokenAmount } from '../../utils/safe-math';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import Button from '../Button';
import { useWallet } from '../../contexts/wallet';
import { useGetPoolManager } from '../../hooks/useGetPoolManager';
import { useFetchSaberPrice } from '../../hooks/useCoinGeckoPrices';

import { TokenPairCardProps } from '../../models/UInterface';
import smallRatioIcon from '../../assets/images/smallRatio.svg';
import linkIcon from '../../assets/images/link.svg';
import { isWalletApproveError } from '../../utils/utils';

import { useUserVaultInfo } from '../../contexts/state';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';
import { FetchingStatus } from '../../types/fetching-types';

const ActivePairCard = ({ data }: TokenPairCardProps) => {
  const history = useHistory();

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const vaultState = useUserVaultInfo(data.mint);
  const totalDebt = +new TokenAmount((vaultState as any)?.debt ?? 0, USDR_MINT_DECIMALS).fixed();
  const positionValue = +new TokenAmount((vaultState as any)?.tvlUsd ?? 0, USDR_MINT_DECIMALS).fixed();
  const mintableDebt = +new TokenAmount((vaultState as any)?.mintableDebt ?? 0, USDR_MINT_DECIMALS).fixed();

  const [isHarvesting, setIsHarvesting] = useState(false);

  const PoolManagerFactory = useGetPoolManager(data.item);
  const { saberPrice, status: saberPriceStatus, error: saberPriceError } = useFetchSaberPrice();

  const printTvl = () => {
    if (isNaN(data.tvl)) {
      return <LoadingSpinner className="spinner-border-sm text-info" />;
    }
    return formatUSD.format(data.tvl);
  };

  const showDashboard = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
    }
  };

  const harvest = async () => {
    setIsHarvesting(true);

    try {
      if (!PoolManagerFactory || !PoolManagerFactory?.harvestReward) {
        throw new Error('Pool manager factory not initialized');
      }

      console.log('Harvesting...');
      await PoolManagerFactory?.harvestReward(connection, wallet, data.item);
      toast.success('Successfully Harvested!');
    } catch (err) {
      console.error(err);
      if (isWalletApproveError(err)) toast.warn('Wallet is not approved!');
      else toast.error('Transaction Error!');
    }

    setIsHarvesting(false);
  };

  const renderModalButton = () => {
    return (
      <div className="col">
        <div className="d-flex">
          <Button
            disabled={!connected || isHarvesting}
            className="button button--gradientBorder activepaircard__generate mt-2"
            onClick={harvest}
          >
            Harvest
          </Button>
          <div className="mx-1"></div>
          <Button
            disabled={!connected}
            className="button button--blue activepaircard__generate mt-2"
            onClick={showDashboard}
          >
            Enter Vault
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="col-xxl-4 col-md-6 col-sm-12">
        <div className={classNames('activepaircard mt-4')}>
          <div className="activepaircard__header">
            <div className="d-flex">
              <div>
                <img src={data.icon} alt={'Token1'} className="tokenpaircard__header-icon" />{' '}
              </div>
              <div className={classNames('activepaircard__titleBox')}>
                <h6>{data.title}</h6>
                <p>TVL {printTvl()}</p>
                {/* <a href={data.platform.link} target="_blank" rel="noreferrer">
                  <div className="d-inline-flex align-items-center mt-1 position-relative">
                    <img src={data.platform.icon} />
                    <p className="semiBold ml-1">{data.platform.name}</p>
                    <img src={linkIcon} alt="linkIcon" className="activepaircard__titleBox--linkIcon" />
                  </div>
                </a> */}
              </div>
            </div>
            <div className="activepaircard__riskBox">
              <div className="text-right">
                <div className="d-flex align-items-center">
                  <img src={smallRatioIcon} alt="smallRatio" />
                  <p className="mx-1">Risk Rating</p>
                  {/* <img src={liskLevelIcon} alt="lisklevel" /> */}
                </div>
                <div className="d-flex justify-content-end mt-1">
                  <h6 className={classNames('ml-1', data.risk)}>{data.risk} </h6>
                </div>
              </div>
            </div>
          </div>
          <div className="activepaircard__aprBox">
            <div className="d-flex align-items-center justify-content-between">
              <h6>Platform:</h6>
              <h6 className="semiBold">
                <a href={data.platform.link} target="_blank" rel="noreferrer">
                  <div className="d-inline-flex align-items-center mt-1 position-relative">
                    <img src={data.platform.icon} />
                    <p className="semiBold ml-1">{data.platform.name}</p>
                    <img src={linkIcon} alt="linkIcon" className="activepaircard__titleBox--linkIcon" />
                  </div>
                </a>
              </h6>
            </div>
            <div className="mt-2 d-flex justify-content-between">
              <h6>APY:</h6>
              <h6 className="semiBold">{Number(data?.apr).toFixed(2)}%</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Debt:</h6>
              <h6 className="semiBold">{Number(totalDebt.toFixed(2))}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Available to Mint:</h6>
              <h6 className="semiBold">{Number(mintableDebt.toFixed(2)).toFixed(2)}</h6>
            </div>
          </div>
          <div className="activepaircard__detailBox">
            <div className="d-flex justify-content-between">
              <h6>Rewards Earned:</h6>

              <h6 className="semiBold">
                {saberPriceStatus === FetchingStatus.Loading && (
                  <LoadingSpinner className="spinner-border-sm text-info" />
                )}
                {saberPriceStatus === FetchingStatus.Error &&
                  toast.error('There was an error when fetching the saber pricehistory') &&
                  console.error(saberPriceError)}
                {saberPriceStatus === FetchingStatus.Finish &&
                  saberPrice &&
                  `$  ${(data.earned_rewards * saberPrice)?.toFixed(USDR_MINT_DECIMALS)}`}
              </h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>Position Value:</h6>
              <h6 className="semiBold">$ {positionValue.toFixed(2)}</h6>
            </div>
          </div>
          <div className="activepaircard__btnBox d-flex">
            {connected ? (
              renderModalButton()
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
        </div>
      </div>
    </>
  );
};

export default ActivePairCard;

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

import { TokenPairCardProps } from '../../types/VaultTypes';
import linkIcon from '../../assets/images/link.svg';
import { isWalletApproveError } from '../../utils/utils';
import smallRatioIcon from '../../assets/images/smallRatio.svg';
import { useAppendUserAction, usePoolInfo, useUserVaultInfo, useSubscribeTx } from '../../contexts/state';
import { HARVEST_ACTION, USDR_MINT_DECIMALS } from '../../utils/ratio-lending';
import USDrIcon from '../../assets/images/USDr.svg';
import infoIcon from '../../assets/images/risklevel.svg';

const ActivePairCard = ({ data }: TokenPairCardProps) => {
  const history = useHistory();

  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const vaultState = useUserVaultInfo(data.mint);
  const poolInfo = usePoolInfo(data.mint);
  const totalDebt = +new TokenAmount((vaultState as any)?.debt ?? 0, USDR_MINT_DECIMALS).fixed();
  const positionValue = +new TokenAmount((vaultState as any)?.tvlUsd ?? 0, USDR_MINT_DECIMALS).fixed();
  const mintableUSDr = +new TokenAmount((vaultState as any)?.mintableUSDr ?? 0, USDR_MINT_DECIMALS).fixed();

  const [isHarvesting, setIsHarvesting] = useState(false);

  const poolManager = useGetPoolManager(data.item);

  const subscribeTx = useSubscribeTx();
  const appendUserAction = useAppendUserAction();

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
      if (!poolManager || !poolManager?.harvestReward) {
        throw new Error('Pool manager factory not initialized');
      }

      console.log('Harvesting...');
      const txHash = await poolManager?.harvestReward(connection, wallet, data.item);
      subscribeTx(
        txHash,
        () => toast.info('Harvest Transaction Sent'),
        () => toast.success('Harvest Confirmed.'),
        () => toast.error('Harvest Transaction Failed')
      );
      appendUserAction(
        wallet.publicKey.toString(),
        data.mint,
        data.realUserRewardMint,
        HARVEST_ACTION,
        0,
        txHash,
        0,
        0,
        0
      );
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
            {/* <div className="activepaircard__riskBox">
              <div className="text-right">
                <div className="d-flex align-items-center">
                  <img src={smallRatioIcon} alt="smallRatio" />
                  <p className="mx-1">Risk Rating</p>
                </div>
                <div className="d-flex justify-content-end mt-1">
                  <h6 className={classNames('ml-1', data.risk)}>{data.risk} </h6>
                </div>
              </div>
            </div> */}
          </div>
          <div className="activepaircard__aprBox">
            <div className="d-flex align-items-center justify-content-between">
              <h6>Platform:</h6>
              <h6 className="semiBold">
                <a href={poolManager.getLpLink(data.title)} target="_blank" rel="noreferrer">
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
              <div className="d-flex align-items-start">
                <h6 className="semiBold">{Number(data?.apr + data?.ratioAPY).toFixed(2)}%</h6>
                {data.ratioAPY !== 0 && (
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 100, hide: 100 }}
                    overlay={
                      <Tooltip id="tooltip">
                        <div className="activepaircard__overlaytooltip">
                          <p>
                            <strong>APY</strong> is made up of:
                          </p>
                          <div className="mb-1">
                            <img src={USDrIcon} alt="USDrIcon" /> Ratio APY: {Number(data?.ratioAPY).toFixed(2)}%
                          </div>
                          <div>
                            <img src={USDrIcon} alt="USDrIcon" /> Yield Farming: {Number(data?.apr).toFixed(2)}%
                          </div>
                        </div>
                      </Tooltip>
                    }
                  >
                    <div className="activepaircard__overlaytrigger">
                      <img src={infoIcon} alt="infoIcon" />
                    </div>
                  </OverlayTrigger>
                )}
              </div>
            </div>
            <div className="mt-2 d-flex justify-content-between">
              <h6>Collateralization Ratio:</h6>
              <h6 className="semiBold">{(100 / poolInfo?.ratio).toFixed(2)}%</h6>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2 tokenpaircard__riskBox">
              <div className="d-flex align-items-center">
                <img src={smallRatioIcon} alt="smallRatio" />
                <p className="mx-1">Risk Rating:</p>
                {/* <img src={liskLevelIcon} alt="lisklevel" /> */}
              </div>
              <h6 className={classNames('ml-1 semiBold', data.risk)}>{data.risk} </h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Debt:</h6>
              <h6 className="semiBold">{Number(totalDebt.toFixed(2))}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Available to Mint:</h6>
              <h6 className="semiBold">{Number(mintableUSDr.toFixed(2)).toFixed(2)}</h6>
            </div>
          </div>
          <div className="activepaircard__detailBox">
            <div className="d-flex justify-content-between">
              <h6>Rewards Earned:</h6>

              <h6 className="semiBold">
                {!vaultState?.rewardUSD ? (
                  <LoadingSpinner className="spinner-border-sm text-info" />
                ) : (
                  `$  ${vaultState?.rewardUSD}`
                )}
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

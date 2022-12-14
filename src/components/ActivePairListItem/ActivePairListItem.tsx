import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { TokenPairCardProps } from '../../types/VaultTypes';
import { TokenAmount } from '../../utils/safe-math';
import { formatUSD, isWalletApproveError } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';

import linkIcon from '../../assets/images/link.svg';
import { IoAlertCircleOutline } from 'react-icons/io5';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { useGetPoolManager } from '../../hooks/useGetPoolManager';
import { useUserVaultInfo, usePoolInfo, useAppendUserAction, useRFStateInfo } from '../../contexts/state';
import { HARVEST_ACTION, USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

import infoIcon from '../../assets/images/risklevel.svg';
import USDrIcon from '../../assets/images/USDr.svg';

const ActivePairListItem = (tokenPairCardProps: TokenPairCardProps) => {
  const { data } = tokenPairCardProps;
  const history = useHistory();

  const { wallet, connected } = useWallet();
  const connection = useConnection();

  const [expand, setExpand] = useState(false);

  const vaultState = useUserVaultInfo(data.mint);
  const poolState = usePoolInfo(data.mint);
  const poolManager = useGetPoolManager(data.item);

  const positionValue = +new TokenAmount((vaultState as any)?.tvlUsd ?? 0, USDR_MINT_DECIMALS).fixed();
  // eslint-disable-next-line
  const [tvl, setTVL] = useState(0);
  // eslint-disable-next-line
  const [tvlUSD, setTVLUSD] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [mintableUSDr, setMintableUsdr] = useState(0);

  const [hasUserReachedDebtLimit, setHasUserReachedDebtLimit] = useState('');

  const [isHarvesting, setIsHarvesting] = useState(false);

  const PoolManagerFactory = useGetPoolManager(data.item);

  const appendUserAction = useAppendUserAction();
  const globalState = useRFStateInfo();

  const harvest_reward_fee = globalState.harvestFeeNumer.toNumber() / globalState.feeDeno.toNumber();

  useEffect(() => {
    // replace this boolean value with a function to determine wether user limit reached
    const userLimitReached = false;
    // replace this boolean value with a function to determine wether global limit reached
    const globalLimitReached = false;
    if (userLimitReached) {
      setHasUserReachedDebtLimit('You have reached your USDr debt limit.');
    }
    if (globalLimitReached) {
      setHasUserReachedDebtLimit('The global USDr debt limit has been reached.');
    }
  }, [wallet, connection]);

  useEffect(() => {
    if (connection && poolState) {
      const tvlAmount = new TokenAmount((poolState as any)?.totalColl ?? 0, poolState?.mintDecimals);
      const tvlUSDAmount = new TokenAmount((poolState as any)?.tvlUsd ?? 0, USDR_MINT_DECIMALS);
      const totalDebtAmount = new TokenAmount((vaultState as any)?.debt ?? 0, USDR_MINT_DECIMALS);
      const mintableUSDrAmount = new TokenAmount((vaultState as any)?.mintableUSDr ?? 0, USDR_MINT_DECIMALS);

      setTVL(Number(tvlAmount.fixed()));
      setTVLUSD(Number(tvlUSDAmount.fixed()));

      setTotalDebt(Number(totalDebtAmount.fixed()));
      setMintableUsdr(Number(mintableUSDrAmount.fixed()));
    }
    return () => {
      setTVL(0);
      setTotalDebt(0);
    };
  }, [connection, poolState]);

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
      const txHash = await PoolManagerFactory?.harvestReward(connection, wallet, data.item);
      appendUserAction(
        wallet.publicKey.toString(),
        data.mint,
        data.realUserRewardMint,
        HARVEST_ACTION,
        vaultState ? vaultState.reward : 0,
        txHash,
        0,
        0,
        harvest_reward_fee
      );

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
      <div>
        <Button
          disabled={!connected || isHarvesting}
          onClick={harvest}
          className="button button--gradientBorder activepaircard__generate"
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
    );
  };

  // eslint-disable-next-line
  const showExpand = () => {
    setExpand(!expand);
  };

  const printTvl = () => {
    if (isNaN(data.tvl)) {
      return <LoadingSpinner className="spinner-border-sm text-info" />;
    }
    return formatUSD.format(data.tvl);
  };

  const isSinglePool = () => {
    return data.platform.symbol === 'Saber';
  };

  return (
    <>
      <tr>
        <td scope="row">
          <div className="align-items-center">
            <div className="d-flex ">
              <div className="d-flex align-items-start">
                <img src={data.icon} alt={'Token1'} className="allvaults__table__icon" />
                {/* <img src={data.icons[0]} alt={data.icons[0].toString()} className="activepaircard__header-icon0" />
                <img src={data.icons[1]} alt={data.icons[1].toString()} className="activepaircard__header-icon1" /> */}
              </div>
              <div className={classNames('activepaircard__titleBox')}>
                <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                <p>TVL {printTvl()}</p>
                <a href={poolManager.getLpLink(data.title)} target="_blank" rel="noreferrer">
                  <div className="d-inline-flex align-items-center mt-1 position-relative">
                    <img src={data.platform.icon} />
                    <p className="semiBold ml-1">{data.platform.name}</p>
                    <img src={linkIcon} alt="linkIcon" className="activepaircard__titleBox--linkIcon" />
                  </div>
                </a>
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
          <div className="tokenpaircard__table__td d-flex">
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
                      <div className="mb-1 flex">
                        <img src={USDrIcon} alt="USDrIcon" /> Ratio APR: {Number(data?.ratioAPY).toFixed(2)}%
                      </div>
                      {isSinglePool() && (
                        <div className="flex mt-2">
                          <img src={USDrIcon} alt="USDrIcon" /> Yield Farming: {Number(data?.apr).toFixed(2)}%
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
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{(100 / poolState.ratio).toFixed(2)}%</h6>
          </div>
        </td>
        <td>
          {isSinglePool() && (
            <div className="d-flex justify-content-between align-items-start">
              <div className="tokenpaircard__table__td">
                <div className="d-flex">
                  <h6 className={classNames('ml-2', data.risk)}>{data.risk} </h6>
                </div>
              </div>
            </div>
          )}
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{Number(totalDebt.toFixed(2))}</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{Number(mintableUSDr?.toFixed(2))}</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{`$ ${vaultState.rewardUSD}`}</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">$ {positionValue.toFixed(2)}</h6>
          </div>
        </td>

        <td>
          <div className="tokenpaircard__table__td">{renderModalButton()}</div>
        </td>
      </tr>
    </>
  );
};

export default ActivePairListItem;

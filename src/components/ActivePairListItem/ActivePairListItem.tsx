import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { TokenPairCardProps } from '../../models/UInterface';
import { TokenAmount } from '../../utils/safe-math';
import { formatUSD, isWalletApproveError } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';

import linkIcon from '../../assets/images/link.svg';
import { IoAlertCircleOutline } from 'react-icons/io5';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { useGetPoolManager } from '../../hooks/useGetPoolManager';
import { UPDATE_REWARD_STATE, useUpdateRFStates, useUserVaultInfo, usePoolInfo } from '../../contexts/state';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

const ActivePairListItem = (tokenPairCardProps: TokenPairCardProps) => {
  const { data } = tokenPairCardProps;
  const history = useHistory();

  const { wallet, connected } = useWallet();
  const connection = useConnection();

  const [expand, setExpand] = useState(false);

  const vaultState = useUserVaultInfo(data.mint);
  const poolState = usePoolInfo(data.mint);
  const updateRFStates = useUpdateRFStates();

  const positionValue = +new TokenAmount((vaultState as any)?.tvlUsd ?? 0, USDR_MINT_DECIMALS).fixed();
  // eslint-disable-next-line
  const [tvl, setTVL] = useState(0);
  // eslint-disable-next-line
  const [tvlUSD, setTVLUSD] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [reaminDebt, setRemainDebt] = useState(0);

  const [hasUserReachedDebtLimit, setHasUserReachedDebtLimit] = useState('');

  const [isHarvesting, setIsHarvesting] = useState(false);

  const PoolManagerFactory = useGetPoolManager(data.item);

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
      const debtAmount = new TokenAmount((poolState as any)?.totalDebt ?? 0, USDR_MINT_DECIMALS);
      const remainAmount = new TokenAmount(
        ((poolState as any)?.debtCeiling ?? 0) - ((poolState as any)?.totalDebt ?? 0),
        USDR_MINT_DECIMALS
      );
      setTVL(Number(tvlAmount.fixed()));
      setTVLUSD(Number(tvlUSDAmount.fixed()));

      setTotalDebt(Number(debtAmount.fixed()));
      setRemainDebt(Number(remainAmount.fixed()));
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
      await PoolManagerFactory?.harvestReward(connection, wallet, data.item);
      await updateRFStates(UPDATE_REWARD_STATE, data.mint);
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
                <a href={data.platform.link} target="_blank" rel="noreferrer">
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
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{Number(data?.apr).toFixed()}%</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{Number(totalDebt.toFixed(2))}</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{Number(reaminDebt.toFixed(2))}</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{formatUSD.format(data.earned_rewards)}</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">$ {positionValue.toFixed(2)}</h6>
          </div>
        </td>
        <td>
          <div className="d-flex justify-content-between align-items-start">
            <div className="tokenpaircard__table__td">
              <div className="d-flex">
                <h6 className={classNames('ml-2', data.risk)}>{data.risk} </h6>
              </div>
            </div>
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

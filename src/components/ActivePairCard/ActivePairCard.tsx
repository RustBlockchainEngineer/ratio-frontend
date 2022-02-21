import React from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PublicKey } from '@solana/web3.js';
import { sleep } from '@project-serum/common';

import { useConnection } from '../../contexts/connection';
import { useUpdateState } from '../../contexts/auth';
import { formatUSD } from '../../utils/utils';
import { useMint } from '../../contexts/accounts';
import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { getTokenVaultByMint, getUpdatedUserState, getUserState, USDR_MINT_KEY } from '../../utils/ratio-lending';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import Button from '../Button';
import { useWallet } from '../../contexts/wallet';
import { useGetPoolInfoProvider } from '../../hooks/useGetPoolInfoProvider';

import { TokenPairCardProps } from '../../models/UInterface';
import liskLevelIcon from '../../assets/images/risklevel.svg';
import smallRatioIcon from '../../assets/images/smallRatio.svg';
import linkIcon from '../../assets/images/link.svg';

const ActivePairCard = ({ data }: TokenPairCardProps) => {
  const history = useHistory();

  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();

  const collMint = useMint(data.mint);
  const tokenPrice = usePrice(data.mint);
  const usdrMint = useMint(USDR_MINT_KEY);
  const [isOpen, setOpen] = React.useState(false);
  const [tvl, setTVL] = React.useState(0);
  const [tvlUSD, setTVLUSD] = React.useState(0);
  const [totalDebt, setTotalDebt] = React.useState(0);
  const [userState, setUserState] = React.useState(null);
  const [positionValue, setPositionValue] = React.useState(0);
  const [hasUserReachedDebtLimit, setHasUserReachedDebtLimit] = React.useState('');

  const poolInfoProviderFactory = useGetPoolInfoProvider(data.item);

  React.useEffect(() => {
    if (userState && tokenPrice && collMint) {
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals);
      setPositionValue(tokenPrice * Number(lpLockedAmount.fixed()));
    }
    return () => {
      setPositionValue(0);
    };
  }, [tokenPrice, userState, collMint]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (updateStateFlag && wallet?.publicKey) {
      getUpdatedUserState(connection, wallet, data.mint, userState).then((res) => {
        setUserState(res);
        setUpdateStateFlag(false);
      });
    }
  }, [updateStateFlag]);

  React.useEffect(() => {
    if (wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(data.mint)).then((res) => {
        setUserState(res);
      });
    }
    return () => {
      setUserState(null);
    };
  }, [wallet, connection, collMint]);

  React.useEffect(() => {
    if (connection && collMint && usdrMint && data.mint) {
      if (updateStateFlag) {
        refreshVaultValues();
      } else {
        updateVaultValues();
      }
    }
    return () => {
      setTVL(0);
      setTotalDebt(0);
    };
  }, [connection, collMint, usdrMint, updateStateFlag]);

  const refreshVaultValues = async () => {
    const oriTvl = tvl;
    const oriTotalDebt = totalDebt;
    let totalDebtAmount = null;
    let tvlAmount = null;
    do {
      await sleep(1000);
      const tokenVault = getTokenVaultByMint(connection, data.mint);
      tvlAmount = new TokenAmount((tokenVault as any).totalColl, collMint?.decimals);
      totalDebtAmount = new TokenAmount((tokenVault as any).totalDebt, usdrMint?.decimals);
    } while (oriTvl === Number(tvlAmount.fixed()) || oriTotalDebt === Number(totalDebtAmount.fixed()));

    setTVL(Number(tvlAmount.fixed()));
    setTotalDebt(Number(totalDebtAmount.fixed()));
  };

  const updateVaultValues = async () => {
    const tokenVault = await getTokenVaultByMint(connection, data.mint);
    const tvlAmount = new TokenAmount((tokenVault as any)?.totalColl ?? 0, collMint?.decimals);
    const debtAmount = new TokenAmount((tokenVault as any)?.totalDebt ?? 0, usdrMint?.decimals);

    setTVL(Number(tvlAmount.fixed()));
    setTotalDebt(Number(debtAmount.fixed()));
  };

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

  const renderModalButton = () => {
    return (
      <div className="col">
        <div className="d-flex">
          <Button
            disabled={!connected}
            className="button button--blue activepaircard__generate mt-2"
            onClick={() => {
              poolInfoProviderFactory?.harvestReward(connection, wallet, data.item);
            }}
          >
            Harvest
          </Button>
          <div className="mx-1"></div>
          <Button
            disabled={!connected}
            className="button button--blue activepaircard__generate mt-2"
            onClick={showDashboard}
          >
            Open Vault
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
                <a href={data.platform.link} target="_blank" rel="noreferrer">
                  <div className="d-inline-flex align-items-center mt-1 position-relative">
                    <img src={data.platform.icon} />
                    <p className="semiBold ml-1">{data.platform.name}</p>
                    <img src={linkIcon} alt="linkIcon" className="activepaircard__titleBox--linkIcon" />
                  </div>
                </a>
              </div>
            </div>
            <div className="activepaircard__riskBox">
              <div className="text-right">
                <div className="d-flex align-items-center">
                  <img src={smallRatioIcon} alt="smallRatio" />
                  <p className="mx-1">Rating</p>
                  <img src={liskLevelIcon} alt="lisklevel" />
                </div>
                <div className="d-flex justify-content-start">
                  <h6 className={classNames('ml-1', data.risk)}>{data.risk} </h6>
                </div>
              </div>
            </div>
          </div>
          <div className="activepaircard__aprBox">
            <div className="d-flex justify-content-between">
              <h6>APR:</h6>
              <h6 className="semiBold">{Number(data?.apr).toFixed()}%</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Debt:</h6>
              <h6 className="semiBold">{formatUSD.format(Number(totalDebt.toFixed(2)))}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>USDr Available to Mint:</h6>
              {/* <h6 className="semiBold"></h6> */}
            </div>
          </div>
          <div className="activepaircard__detailBox">
            <div className="d-flex justify-content-between">
              <h6>Position Value:</h6>
              <h6 className="semiBold">$ {positionValue.toFixed(2)}</h6>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <h6>Rewards earned:</h6>
              <h6 className="semiBold">{formatUSD.format(data.earned_rewards)}</h6>
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

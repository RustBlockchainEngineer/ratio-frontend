import React from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classNames from 'classnames';
import { PublicKey } from '@solana/web3.js';
import { sleep } from '@project-serum/common';

import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { selectors } from '../../features/dashboard';
import { TokenPairCardProps } from '../../models/UInterface';
import { useMint } from '../../contexts/accounts';
import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { formatUSD } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';
import { getTokenVaultByMint, getUpdatedUserState, getUserState } from '../../utils/ratio-lending';
import { useUpdateState } from '../../contexts/auth';
import liskLevelIcon from '../../assets/images/risklevel.svg';
import smallRatioIcon from '../../assets/images/smallRatio.svg';
import highriskIcon from '../../assets/images/highrisk.svg';
import { IoAlertCircleOutline } from 'react-icons/io5';
import linkIcon from '../../assets/images/link.svg';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { MINTADDRESS } from '../../constants';
import { useGetPoolInfoProvider } from '../../hooks/useGetPoolInfoProvider';

const TokenPairCard = ({ data, onCompareVault }: TokenPairCardProps) => {
  const history = useHistory();

  const compare_vaults_status = useSelector(selectors.getCompareVaultsStatus);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();

  const collMint = useMint(data.mint);
  const tokenPrice = usePrice(data.mint);
  const usdrMint = useMint(MINTADDRESS['USDR']);

  const [isOpen, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [userState, setUserState] = React.useState(null);
  const [positionValue, setPositionValue] = React.useState(0);
  const [tvl, setTVL] = React.useState(0);
  const [tvlUSD, setTVLUSD] = React.useState(0);
  const [totalDebt, setTotalDebt] = React.useState(0);

  const [hasUserReachedDebtLimit, setHasUserReachedDebtLimit] = React.useState('');

  const poolInfoProviderFactory = useGetPoolInfoProvider(data.item);

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
    if (wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(data.mint)).then((res) => {
        setUserState(res);
      });
    }
    return () => {
      setUserState(null);
    };
  }, [wallet, connection, collMint]);

  const updateVaultValues = async () => {
    const tokenVault = await getTokenVaultByMint(connection, data.mint);
    const tvlAmount = new TokenAmount((tokenVault as any).totalColl, collMint?.decimals);
    const debtAmount = new TokenAmount((tokenVault as any).totalDebt, usdrMint?.decimals);

    setTVL(Number(tvlAmount.fixed()));
    setTotalDebt(Number(debtAmount.fixed()));
  };

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

  React.useEffect(() => {
    if (tokenPrice && tvl) {
      setTVLUSD(Number((tokenPrice * tvl).toFixed(2)));
    }
  }, [tvl, tokenPrice]);

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
    if (updateStateFlag && wallet?.publicKey) {
      getUpdatedUserState(connection, wallet, data.mint, userState).then((res) => {
        setUserState(res);
        setUpdateStateFlag(false);
      });
    }
  }, [updateStateFlag]);

  const renderModalButton = () => {
    return (
      <div className="col">
        <div className="d-flex">
          <Button
            disabled={!connected}
            className="button button--blue generate mt-2"
            onClick={() => {
              poolInfoProviderFactory?.harvestReward(connection, wallet);
            }}
          >
            Harvest
          </Button>
          <div className="mx-1"></div>
          <Button disabled={!connected} className="button button--blue generate mt-2" onClick={showDashboard}>
            Open Vault
          </Button>
        </div>
      </div>
    );
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

  const printTvl = () => {
    if (isNaN(data.tvl)) {
      return <LoadingSpinner className="spinner-border-sm text-info" />;
    }
    return formatUSD.format(data.tvl);
  };

  return (
    <>
      <div className="col col-xxl-4 col-lg-6 col-md-12">
        <div
          className={classNames('tokenpaircard mt-4', {
            'tokenpaircard--warning': hasUserReachedDebtLimit,
          })}
        >
          <div className="tokenpaircard__header">
            <div className="d-flex align-items-start">
              <div className="d-flex align-items-center">
                <img src={data.icons[0]} alt={'Token1'} />
                <img src={data.icons[1]} alt={'Token2'} className="tokenpaircard__header-icon" />
              </div>
              <div className="tokenpaircard__titleBox">
                <div>
                  <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                </div>
                <p>TVL {printTvl()}</p>
              </div>
            </div>
            <div className="tokenpaircard__riskBox mt-2">
              <div className="text-right">
                <div className="d-flex">
                  <img src={smallRatioIcon} alt="smallRatio" />
                  <p>Risk Rating</p>
                  <img src={liskLevelIcon} alt="lisklevel" />
                </div>
                <div className="d-flex justify-content-end">
                  <h6 className={classNames('ml-1', data.risk)}>{data.risk} </h6>
                </div>
              </div>
            </div>
          </div>
          <div className="tokenpaircard__aprBox">
            <div>
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
              <h5>APR:</h5>
              <h6 className="semiBold mt-1">{Number(data?.apr).toFixed()}%</h6>
            </div>
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
          <div className="tokenpaircard__detailBox">
            {isOpen && (
              <div className="tokenpaircard__detailBox__content">
                <div className="d-flex justify-content-between">
                  <div>
                    Position value
                    <p>$ {positionValue.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    Rewards earned
                    <p>{formatUSD.format(data.earned_rewards)}</p>
                  </div>
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <div>
                    USDr Debt
                    <p>{formatUSD.format(Number(totalDebt.toFixed(2)))}</p>
                  </div>
                  <div className="text-right">
                    Ratio TVL
                    <p>{formatUSD.format(tvlUSD)}</p>
                  </div>
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

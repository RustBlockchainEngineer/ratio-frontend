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

import { useUpdateHistory } from '../../contexts/auth';
import liskLevelIcon from '../../assets/images/risklevel.svg';
import smallRatioIcon from '../../assets/images/smallRatio.svg';
import highriskIcon from '../../assets/images/highrisk.svg';
import { IoAlertCircleOutline } from 'react-icons/io5';
import linkIcon from '../../assets/images/link.svg';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { useGetPoolInfoProvider } from '../../hooks/useGetPoolInfoProvider';
import {
  UPDATE_REWARD_STATE,
  useUpdateRFStates,
  useUSDrMintInfo,
  useUserInfo,
  useVaultInfo,
  useVaultMintInfo,
} from '../../contexts/state';

const TokenPairCard = ({ data, onCompareVault, isGlobalDebtLimitReached }: TokenPairCardProps) => {
  const history = useHistory();

  const compare_vaults_status = useSelector(selectors.getCompareVaultsStatus);
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const tokenPrice = usePrice(data.mint);

  const usdrMint = useUSDrMintInfo();
  const collMint = useVaultMintInfo(data.mint);

  const [isOpen, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  const userState = useUserInfo(data.mint);
  const vaultState = useVaultInfo(data.mint);
  const updateRFStates = useUpdateRFStates();

  const [positionValue, setPositionValue] = React.useState(0);
  const [tvl, setTVL] = React.useState(0);
  const [tvlUSD, setTVLUSD] = React.useState(0);
  const [totalDebt, setTotalDebt] = React.useState(0);

  const [hasUserReachedDebtLimit, setHasUserReachedDebtLimit] = React.useState('');

  const poolInfoProviderFactory = useGetPoolInfoProvider(data.item);

  // React.useEffect(() => {
  //   if (data.hasReachedUserDebtLimit) {
  //     setHasUserReachedDebtLimit('You have reached your USDr debt limit.');
  //   } else if (isGlobalDebtLimitReached) {
  //     setHasUserReachedDebtLimit('The global USDr debt limit has been reached.');
  //   } else {
  //     setHasUserReachedDebtLimit('');
  //   }
  //   return () => {
  //     setHasUserReachedDebtLimit('');
  //   };
  // }, [data]);

  React.useEffect(() => {
    if (connection && collMint && usdrMint && data.mint) {
      const tvlAmount = new TokenAmount((vaultState as any)?.lockedCollBalance ?? 0, collMint?.decimals);
      const debtAmount = new TokenAmount((vaultState as any)?.debt ?? 0, usdrMint?.decimals);

      setTVL(Number(tvlAmount.fixed()));
      setTotalDebt(Number(debtAmount.fixed()));
    }
    return () => {
      setTVL(0);
      setTotalDebt(0);
    };
  }, [connection, collMint, usdrMint, vaultState]);

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

  const harvest = () => {
    console.log('harvesting');
    poolInfoProviderFactory
      ?.harvestReward(connection, wallet, data.item)
      .then(() => {
        updateRFStates(UPDATE_REWARD_STATE, data.mint);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        toast('Successfully Harvested!');
      });
  };
  const renderModalButton = () => {
    return (
      <div className="col">
        <div className="d-flex">
          <Button
            disabled={!connected}
            className="button button--blue tokenpaircard__generate mt-2"
            onClick={showDashboard}
          >
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
            <div className="tokenpaircard__riskBox">
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
              <h5>APY:</h5>
              <h6 className="semiBold mt-1">{Number(data?.apr).toFixed(2)}%</h6>
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
        </div>
      </div>
    </>
  );
};

export default TokenPairCard;

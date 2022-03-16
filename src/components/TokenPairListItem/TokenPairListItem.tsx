import React from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { TokenPairCardProps } from '../../models/UInterface';

import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { formatUSD } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';
import linkIcon from '../../assets/images/link.svg';
import { IoAlertCircleOutline } from 'react-icons/io5';

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

const TokenPairListItem = (tokenPairCardProps: TokenPairCardProps) => {
  const { data } = tokenPairCardProps;
  const history = useHistory();

  const tokenPrice = usePrice(data.mint);
  const { wallet, connected } = useWallet();
  const connection = useConnection();

  const usdrMint = useUSDrMintInfo();
  const collMint = useVaultMintInfo(data.mint);

  const updateRFStates = useUpdateRFStates();

  const userState = useUserInfo(data.mint);
  const vaultState = useVaultInfo(data.mint);

  // eslint-disable-next-line
  const [positionValue, setPositionValue] = React.useState(0);
  const [tvl, setTVL] = React.useState(0);
  // eslint-disable-next-line
  const [tvlUSD, setTVLUSD] = React.useState(0);
  // eslint-disable-next-line
  const [totalDebt, setTotalDebt] = React.useState(0);

  // eslint-disable-next-line
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

  const showDashboard = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
    }
  };

  // eslint-disable-next-line
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
          <div className="tokenpaircard__table__td">
            <h6 className="semiBold">{Number(data?.apr).toFixed()}%</h6>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <a href={data.platform.link} target="_blank" rel="noreferrer">
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

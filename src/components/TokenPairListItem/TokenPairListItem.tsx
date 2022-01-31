import React from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { PublicKey } from '@solana/web3.js';

import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { TokenPairCardProps } from '../../models/UInterface';
import { useMint } from '../../contexts/accounts';
import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { formatUSD } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';
import { getTokenVaultByMint, getUpdatedUserState, getUserState } from '../../utils/ratio-lending';
import linkIcon from '../../assets/images/link.svg';
import { sleep } from '@project-serum/common';
import { useUpdateState } from '../../contexts/auth';

const TokenPairListItem = ({ data, onCompareVault }: TokenPairCardProps) => {
  const history = useHistory();

  const tokenPrice = usePrice(data.mint);
  const { wallet, connected, publicKey } = useWallet();
  const connection = useConnection();
  const collMint = useMint(data.mint);
  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();

  const [expand, setExpand] = React.useState(false);
  const [userState, setUserState] = React.useState(null);
  const [positionValue, setPositionValue] = React.useState(0);
  const [tvl, setTVL] = React.useState(0);
  const [tvlUSD, setTVLUSD] = React.useState(0);

  console.log('data', data);
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

  const showTVL = async () => {
    const tokenVault = await getTokenVaultByMint(connection, data.mint);
    const tvlAmount = new TokenAmount((tokenVault as any).totalColl, collMint?.decimals);
    setTVL(Number(tvlAmount.fixed()));
  };

  const updateTVL = async () => {
    const oriAmount = tvl;
    let tvlAmount = null;
    do {
      await sleep(300);
      const tokenVault = getTokenVaultByMint(connection, data.mint);
      tvlAmount = new TokenAmount((tokenVault as any).totalColl, collMint?.decimals);
    } while (oriAmount === Number(tvlAmount.fixed()));

    setTVL(Number(tvlAmount.fixed()));
  };

  React.useEffect(() => {
    if (connection && collMint && data.mint) {
      if (updateStateFlag) {
        updateTVL();
      } else {
        showTVL();
      }
    }
    return () => {
      setTVL(0);
    };
  }, [connection, collMint, updateStateFlag]);

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

  const showDashboard = () => {
    if (!connected) {
      toast('Please connect your wallet!');
    } else {
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
    }
  };

  const renderModalButton = () => {
    return (
      <div className="d-inline-flex">
        <Button disabled={!connected} className="button button--gradientBorder generate mt-2">
          Harvest
        </Button>
        <div className="mx-1"></div>
        <Button disabled={!connected} className="button button--fill generate mt-2" onClick={showDashboard}>
          Open Vault
        </Button>
      </div>
    );
  };

  const showExpand = () => {
    setExpand(!expand);
  };

  return (
    <>
      <tr>
        <th scope="row" className="align-middle">
          <div className="align-items-center">
            <div className="d-flex ">
              <div className="d-flex align-items-center">
                <img src={data.icons[0]} alt={data.icons[0].toString()} className="activepaircard__header-icon0" />
                <img src={data.icons[1]} alt={data.icons[1].toString()} className="activepaircard__header-icon1" />
              </div>
              <div className={classNames('activepaircard__titleBox')}>
                <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                <p>TVL {formatUSD.format(data.tvl)}</p>
              </div>
            </div>
          </div>
          <div className="mt-1 d-block">{renderModalButton()}</div>
        </th>
        <td>
          <div className="tokenpaircard__table__td">
            <h5>Platform:</h5>
            <a href={data.platform.link} target="_blank" rel="noreferrer">
              <div className="d-flex align-items-center mt-2 position-relative">
                <img src={data.platform.icon} />
                <h6 className="semiBold ml-1 tokenpaircard__table__td--platformName">{data.platform.name}</h6>
                <img src={linkIcon} alt="linkIcon" className="tokenpaircard__table__td--linkIcon" />
              </div>
            </a>
          </div>
        </td>
        <td>
          <div className="tokenpaircard__table__td">
            <h5>APR</h5>
            <h6 className="semiBold mt-2">{data.apr}%</h6>
          </div>
        </td>
        <td>
          <div className="d-flex justify-content-between align-items-start">
            <div className="tokenpaircard__table__td">
              <h5>Ratio Risk Rating:</h5>
              <div className="d-flex mt-2">
                <h6 className={classNames('ml-2 mt-1', data.risk)}>{data.risk} </h6>
              </div>
            </div>
            <div className="mt-1 expand_arrow">
              {expand ? (
                <IoIosArrowUp size={20} onClick={showExpand} />
              ) : (
                <IoIosArrowDown size={20} onClick={showExpand} />
              )}
            </div>
          </div>
        </td>
      </tr>
      {expand && (
        <tr>
          <td colSpan={4}>
            <div className="tokenpaircard__detailBox__content d-flex justify-content-between">
              <div>
                Position value
                <p>$ {positionValue.toFixed(2)}</p>
              </div>
              <div>
                Rewards Earned
                <p>$ 0.00</p>
              </div>
              <div>
                USDr Debt
                <p>$ {positionValue.toFixed(2)}</p>
              </div>
              <div>
                Ratio TVL
                <p>{formatUSD.format(tvlUSD)}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TokenPairListItem;

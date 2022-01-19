import React, { useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { getRiskLevel } from '../../libs/helper';

import { useWallet } from '../../contexts/wallet';
import Button from '../Button';
import { TokenPairCardProps } from '../../models/UInterface';
import { useMint } from '../../contexts/accounts';
import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { formatUSD } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';
import { getUserState } from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';

import highriskIcon from '../../assets/images/highrisk.svg';
import linkIcon from '../../assets/images/link.svg';
import arrowDownIcon from '../../assets/images/arrow-down.svg';

const TokenPairListItem = ({ data, onCompareVault }: TokenPairCardProps) => {
  const history = useHistory();

  const [expand, setExpand] = useState(false);
  const tokenPrice = usePrice(data.mint);
  const [positionValue, setPositionValue] = React.useState(0);
  const { wallet, connected, publicKey } = useWallet();
  const [userState, setUserState] = React.useState(null);
  const connection = useConnection();
  const collMint = useMint(data.mint);

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
        <th scope="row" className="align-middle" onClick={showExpand}>
          <div className="align-items-center">
            <div className="d-flex ">
              <div className="d-flex align-items-center">
                <img src={data.icons[0]} alt={data.icons[0].toString()} className="activepaircard__header-icon0" />
                <img src={data.icons[1]} alt={data.icons[1].toString()} className="activepaircard__header-icon1" />
              </div>
              <div className={classNames('activepaircard__titleBox')}>
                <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                <p>TVL: {formatUSD.format(data.tvl)}</p>
              </div>
            </div>
          </div>
          <div className="mt-1 d-block">{renderModalButton()}</div>
        </th>
        <td onClick={showExpand}>
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
        <td onClick={showExpand}>
          <div className="tokenpaircard__table__td">
            <h5>APR</h5>
            <h6 className="semiBold mt-2">{data.apr}%</h6>
          </div>
        </td>
        <td onClick={showExpand}>
          <div className="d-flex justify-content-between align-items-start">
            <div className="tokenpaircard__table__td">
              <h5>Ratio Risk Rating:</h5>
              <div className="d-flex mt-2">
                {(getRiskLevel(data.risk) === 'DDD' || getRiskLevel(data.risk) === 'DD') && (
                  <img src={highriskIcon} alt="highriskIcon" className="highrisk" />
                )}
                <h6 className={classNames('ml-2 mt-1', getRiskLevel(data.risk))}>{getRiskLevel(data.risk)} </h6>
              </div>
            </div>
            <div className="mt-1">
              <img src={arrowDownIcon} alt="arrowDownIcon" />
            </div>
          </div>
        </td>
      </tr>
      {expand && (
        <tr>
          <td colSpan={4}>
            <div>
              Position value:
              <p>$ {positionValue.toFixed(2)}</p>
              <div className="tokenpaircard__detailBox__content--tokens">
                {/* <img src={row.icons[0]} alt="RayIcon" /> */}
                RAY: $4200
              </div>
              <div className="tokenpaircard__detailBox__content--tokens">
                {/* <img src={row.icons[1]} alt="USDrIcon" /> */}
                USDr: $6400
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TokenPairListItem;

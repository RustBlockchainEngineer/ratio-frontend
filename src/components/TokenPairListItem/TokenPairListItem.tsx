import React, { useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { getRiskLevel } from '../../libs/helper';

import { useWallet } from '../../contexts/wallet';
import LockVaultModal from '../LockVaultModal';
import MintUSDrModal from '../MintUSDrModal';
import Button from '../Button';
import { TokenPairCardProps } from '../../models/UInterface';
import { useMint } from '../../contexts/accounts';
import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { formatUSD } from '../../utils/utils';
import { useConnection } from '../../contexts/connection';
import { getUserState } from '../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';

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

  const renderModalButton = (row: any) => {
    if (connected) {
      return (
        <div className="d-flex justify-content-end">
          <div>
            <LockVaultModal data={row} />
          </div>
          <div className="ml-1">
            <MintUSDrModal data={row} />
          </div>
          <div className="ml-1">
            <Button disabled={positionValue === 0} className="button button--fill generate" onClick={showDashboard}>
              Enter Vault
            </Button>
          </div>
        </div>
      );
    }
  };

  const showExpand = () => {
    setExpand(!expand);
  };

  return (
    <>
      <tr onClick={showExpand}>
        <th scope="row" className="align-middle">
          <div className="align-items-center">
            <div className="d-flex ">
              <div>
                <img src={data.icons[0]} alt={data.icons[0].toString()} className="activepaircard__header-icon0" />
                <img src={data.icons[1]} alt={data.icons[1].toString()} className="activepaircard__header-icon1" />
              </div>
              <div className={classNames('activepaircard__titleBox')}>
                <h6>{data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title}</h6>
                <p>TVL: {formatUSD.format(data.tvl)}</p>
              </div>
            </div>
          </div>
        </th>
        <td className="align-middle">
          <h6 className="semiBold">{data.apr}%</h6>
        </td>
        <td className="align-middle">
          <h6 className={classNames('semiBold', getRiskLevel(data.risk))}>{getRiskLevel(data.risk)}</h6>
        </td>
        <td className="align-middle">{renderModalButton(data)}</td>
      </tr>
      {expand && (
        <tr>
          <td>
            <div>
              Position value:
              <p>$ {positionValue.toFixed(2)}</p>
              {/* <div className="tokenpaircard__detailBox__content--tokens">
              <img src={row.icons[0]} alt="RayIcon" />
              RAY: $4200
            </div>
            <div className="tokenpaircard__detailBox__content--tokens">
              <img src={row.icons[1]} alt="USDrIcon" />
              USDr: $6400
            </div> */}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TokenPairListItem;

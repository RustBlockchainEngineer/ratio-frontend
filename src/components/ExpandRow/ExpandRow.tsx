import React from 'react';
import { usePrice } from '../../contexts/price';
import { getTokenVaultByMint, getUpdatedUserState, getUserState } from '../../utils/ratio-lending';
import { useConnection } from '../../contexts/connection';
import { PublicKey } from '@solana/web3.js';
import { TokenAmount } from '../../utils/safe-math';
import { useMint } from '../../contexts/accounts';
import { useWallet } from '../../contexts/wallet';

const ExpandContent = (data: any) => {
  const tokenPrice = usePrice(data.mint);
  const [positionValue, setPositionValue] = React.useState(0);
  const { wallet, connected } = useWallet();
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

  return (
    <div className="tokenpaircard__detailBox__content">
      <div className="d-flex justify-content-between">
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
        <div className="text-right">
          Rewards earned:
          <p>$0</p>
        </div>
      </div>
      {/* <div className="mt-3 w-25">
          <Button className="button--fill lp-button">Harvest</Button>
        </div> */}
    </div>
  );
};

export default ExpandContent;

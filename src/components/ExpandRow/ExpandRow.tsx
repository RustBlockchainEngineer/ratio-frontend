import React from 'react';
import { usePrice } from '../../contexts/price';
import { TokenAmount } from '../../utils/safe-math';
import { useUserVaultInfo, useTokenMintInfo } from '../../contexts/state';

const ExpandContent = (data: any) => {
  const tokenPrice = usePrice(data.mint);
  const [positionValue, setPositionValue] = React.useState(0);

  const collMint = useTokenMintInfo(data.mint);
  const userState = useUserVaultInfo(data.mint);

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
          <p>$ {positionValue?.toFixed(2)}</p>
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

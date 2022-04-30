import React from 'react';
import { TokenAmount } from '../../utils/safe-math';
import { useUserVaultInfo } from '../../contexts/state';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

const ExpandContent = (data: any) => {
  const vaultState = useUserVaultInfo(data.mint);
  const positionValue = +new TokenAmount((vaultState as any)?.tvlUsd ?? 0, USDR_MINT_DECIMALS).fixed();

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

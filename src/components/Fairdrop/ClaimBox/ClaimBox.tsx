import React from 'react';
import circlesmallRatioIcon from '../../../assets/images/circlesmallratio.svg';
import Button from '../../Button';

type props = {
  ratioValue: string;
};

const ClaimBox = ({ ratioValue }: props) => {
  return (
    <div className="claimbox">
      <div>
        <p className="claimbox__label">
          <img src={circlesmallRatioIcon} alt="circlsmallRatioIcon" />
          Unclaimed Fairdrop
        </p>
        <p className="claimbox__value">{ratioValue} RATIO</p>
      </div>
      <div>
        <Button disabled={false} className="button--blue claimbox__btn">
          Claim
        </Button>
      </div>
    </div>
  );
};

export default ClaimBox;

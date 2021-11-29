import React from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import CustomInput from '../../components/CustomInput';
import CustomSelect from '../../components/CustomSelect';
import Button from '../../components/Button';

import { getTokenBySymbol } from '../../utils/tokens';

import usdrIcon from '../../assets/images/USDr.png';
import usdcIcon from '../../assets/images/USDC.svg';
import rayIcon from '../../assets/images/RAY.svg';
import solIcon from '../../assets/images/SOL.svg';
import ethIcon from '../../assets/images/ETH.svg';
import srmIcon from '../../assets/images/SRM.svg';
import mediaIcon from '../../assets/images/MEDIA.svg';

const options1 = [
  {
    value: 'USDC-USDR',
    label: 'USDC-USDR-LP',
    icon: [`https://sdk.raydium.io/icons/${getTokenBySymbol('USDC')?.mintAddress}.png`, usdrIcon],
  },
  {
    value: 'ETH-SOL',
    label: 'ETH-SOL-LP',
    icon: [
      `https://sdk.raydium.io/icons/${getTokenBySymbol('ETH')?.mintAddress}.png`,
      `https://sdk.raydium.io/icons/${getTokenBySymbol('SOL')?.mintAddress}.png`,
    ],
  },
  {
    value: 'ATLAS-RAY',
    label: 'ATLAS-RAY-LP',
    icon: [
      `https://sdk.raydium.io/icons/${getTokenBySymbol('ATLAS')?.mintAddress}.png`,
      `https://sdk.raydium.io/icons/${getTokenBySymbol('RAY')?.mintAddress}.png`,
    ],
  },
  {
    value: 'SAMO-RAY',
    label: 'SAMO-RAY-LP',
    icon: [
      `https://sdk.raydium.io/icons/${getTokenBySymbol('SAMO')?.mintAddress}.png`,
      `https://sdk.raydium.io/icons/${getTokenBySymbol('RAY')?.mintAddress}.png`,
    ],
  },
];

const Faucet = () => {
  const history = useHistory();

  const [amount, setAmount] = React.useState(0);

  const [submitState, setSubmitState] = React.useState(false);

  const onCancel = () => {
    history.push('/dashboard');
  };

  const getInputValue = (value) => {
    if (value === '') {
      setAmount(0);
    } else {
      setAmount(parseInt(value));
    }
  };

  const onSubmit = () => {
    setSubmitState(true);
  };

  return (
    <div className="faucet" data-theme="light">
      <div className="faucet__card">
        <div className="faucet__card__top">
          <h3>Ratio LP Token Faucet</h3>
          <h6>
            This LP is for devnet only and will help the Ratio team test platform functionality prior to mainnet
            release.
          </h6>
          <label>Choose which LP you wish to mint</label>
          <CustomSelect options={options1} />
          <label className="mt-4">Choose the amount you would like to mint</label>
          <CustomInput appendStr="Max" appendValueStr="100" onTextChange={getInputValue} />
          {submitState && (
            <div className="submitted">You&rsquo;ve successfully minted {amount} Ray-Sol Testnet tokens</div>
          )}
        </div>
        <div className="faucet__card__footer">
          {submitState && (
            <Button className="button swaptokensBtn swaptokensBtn--border" onClick={onCancel}>
              Return to dashboard
            </Button>
          )}
          {!submitState && (
            <>
              <div className="col pl-1">
                <Button className="button swaptokensBtn swaptokensBtn--border" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
              <div className="col pr-1" onClick={onSubmit}>
                <Button
                  className={classNames('swaptokensBtn', amount === 0 ? 'button--disabled' : 'button--fill')}
                  disabled={amount === 0}
                >
                  Submit
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faucet;

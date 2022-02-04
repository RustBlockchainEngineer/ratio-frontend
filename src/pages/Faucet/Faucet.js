import React from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import CustomSelect from '../../components/CustomSelect';
import Button from '../../components/Button';
import { ThemeContext } from '../../contexts/ThemeContext';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import {
  createFaucetState,
  faucetUsdcUsdrLp,
  faucetEthSolLp,
  faucetAtlasRayLp,
  faucetSamoRayLp,
  isFaucetStateCreated,
} from '../../utils/ratio-faucet';
import { TOKEN_VAULT_OPTIONS } from '../../utils/ratio-lending';
// import { toast } from 'react-toastify';

const Faucet = () => {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;
  const connect = gWallet.connect;
  const history = useHistory();
  const [amount, setAmount] = React.useState(0);
  const [option, setOption] = React.useState(TOKEN_VAULT_OPTIONS[0]);

  const [submitState, setSubmitState] = React.useState(false);
  const [isCreated, setIsCreated] = React.useState(false);
  const [faucetStatus, setFaucetStatus] = React.useState('');

  React.useEffect(async () => {
    if (gWallet.connected) {
      setIsCreated(await isFaucetStateCreated(connection, wallet));
    }
  }, [gWallet]);

  const onCancel = () => {
    history.goBack();
  };

  const getInputValue = (value) => {
    if (value === '') {
      setAmount(0);
    } else {
      setAmount(parseInt(value));
    }
  };

  const onCreateFaucet = async () => {
    await createFaucetState(connection, wallet);
    setIsCreated(await isFaucetStateCreated(connection, wallet));
  };

  const onSubmit = async () => {
    setFaucetStatus('minting ...');
    let tx;
    try {
      if (option.value === 'USDC-USDR') {
        tx = await faucetUsdcUsdrLp(connection, wallet);
      } else if (option.value === 'ETH-SOL') {
        tx = await faucetEthSolLp(connection, wallet);
      } else if (option.value === 'ATLAS-RAY') {
        tx = await faucetAtlasRayLp(connection, wallet);
      } else if (option.value === 'SAMO-RAY') {
        tx = await faucetSamoRayLp(connection, wallet);
      } else {
        setFaucetStatus('Please select a faucet token.');
        return;
      }
      setFaucetStatus('You have minted $10 worth of ' + option.value + ' LP tokens');
    } catch (e) {
      console.log(e);
      setFaucetStatus('Error occured! please check your transaction.');
    }
  };

  const onChangeLp = (value) => {
    setFaucetStatus('');
    setOption(value);
  };

  return (
    <div className="faucet" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="faucet__card">
        <div className="faucet__card__top">
          <h3>Ratio LP Token Faucet</h3>
          <h6>
            This LP is for devnet only and will help the Ratio team test platform functionality prior to mainnet
            release.
          </h6>
          <label>Choose which LP you wish to mint</label>
          <CustomSelect options={TOKEN_VAULT_OPTIONS} onChange={onChangeLp} />
          {faucetStatus !== '' && <div className="faucet__success">{faucetStatus}</div>}
          {/* <label className="mt-4">Choose the amount you would like to mint</label>
          <CustomInput appendStr="Max" appendValueStr="100" onTextChange={getInputValue} />
          {submitState && (
            <div className="submitted">You&rsquo;ve successfully minted {amount} Ray-Sol Testnet tokens</div>
          )} */}
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
                <Button className="button--blue swaptokensBtn " onClick={onCancel}>
                  Exit
                </Button>
              </div>
              <div className="col pr-1" onClick={!gWallet.connected ? connect : isCreated ? onSubmit : onCreateFaucet}>
                <Button
                  className={classNames('swaptokensBtn', amount === -1 ? 'button--disabled' : 'button--blue')}
                  disabled={!gWallet.connected}
                >
                  {isCreated ? 'Mint' : 'Create Faucet'}
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

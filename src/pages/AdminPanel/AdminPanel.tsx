import { PublicKey } from '@solana/web3.js';
import React from 'react';

import Button from '../../components/Button';
import CustomSelect from '../../components/CustomSelect';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { getFaucetState, isFaucetStateCreated } from '../../utils/ratio-faucet';
import {
  createGlobalState,
  createTokenVault,
  isGlobalStateCreated,
  TOKEN_VAULT_OPTIONS,
} from '../../utils/ratio-lending';
import Header from '../../components/Header';
import { useDispatch } from 'react-redux';
import { actionTypes } from '../../features/wallet';
import { ThemeContext } from '../../contexts/ThemeContext';
import { Redirect, Route, Switch } from 'react-router-dom';
import FeesAdminForm from '../FeesAdminForm';
import WhitelistAdminForm from '../WhitelistAdminForm';
import CeilingsAdminForm from '../CeilingsAdminForm';
import CollRatiosAdminForm from '../CollRatiosAdminForm';
import LpTokenAdminForm from '../LpTokenAdminForm';
import { AuthContextProvider as APIAuthContextProvider } from '../../contexts/authAPI';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Roles } from '../../constants';

const AdminPanel = () => {
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;

  const [riskLevel, setRiskLevel] = React.useState(0);
  const [mintAddress, setMintAddress] = React.useState('');
  const [isCreated, setIsCreated] = React.useState(false);
  const [option, setOption] = React.useState(TOKEN_VAULT_OPTIONS[0]);

  const dispatch = useDispatch();

  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET });
  };

  const onCreateProgramState = async () => {
    await createGlobalState(connection, wallet);
    setIsCreated(await isGlobalStateCreated(connection, wallet));
  };
  const onCreateTokenVault = async () => {
    await createTokenVault(connection, wallet, new PublicKey(mintAddress), riskLevel);
  };

  React.useEffect(() => {
    if (gWallet.connected) {
      console.log('finding faucet state ...');
      getFaucetState(connection, wallet).then((faucetState) => {
        if (faucetState) {
          if (option.value === 'USDC-USDR') {
            setRiskLevel(0);
            setMintAddress(faucetState.mintUsdcUsdrLp.toBase58());
          } else if (option.value === 'ETH-SOL') {
            setRiskLevel(1);
            setMintAddress(faucetState.mintEthSolLp.toBase58());
          } else if (option.value === 'ATLAS-RAY') {
            setRiskLevel(2);
            setMintAddress(faucetState.mintAtlasRayLp.toBase58());
          } else if (option.value === 'SAMO-RAY') {
            setRiskLevel(3);
            setMintAddress(faucetState.mintSamoRayLp.toBase58());
          }
        } else {
          console.log('please create faucet state');
        }
      });
      isGlobalStateCreated(connection, wallet).then((result) => {
        setIsCreated(result);
      });
    }
  }, [option, gWallet.connected]);

  const onChangeLp = async (value: any) => {
    if (!gWallet.connected) {
      alert('not connected wallet');
    }
    setOption(value);
  };

  return (
    <APIAuthContextProvider>
      <div className="adminpanel">
        <Switch>
          <ProtectedRoute role={Roles.ADMIN} path="/adminpanel/fees" component={FeesAdminForm} exact />
          <ProtectedRoute role={Roles.ADMIN} path="/adminpanel/whitelist" component={WhitelistAdminForm} exact />
          <ProtectedRoute role={Roles.ADMIN} path="/adminpanel/ceilings" component={CeilingsAdminForm} exact />
          <ProtectedRoute
            role={Roles.ADMIN}
            path="/adminpanel/collateralizationratios"
            component={CollRatiosAdminForm}
            exact
          />
          <ProtectedRoute role={Roles.ADMIN} path="/adminpanel/lptoken" component={LpTokenAdminForm} exact />
        </Switch>
      </div>
    </APIAuthContextProvider>
  );
};

export default AdminPanel;

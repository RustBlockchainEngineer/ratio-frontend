import React, { useMemo } from 'react';
// import { IoIosArrowRoundForward } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useAccountByMint } from '../../contexts/accounts';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';

import { isWalletApproveError } from '../../utils/utils';
import Button from '../Button';
import CustomInput from '../CustomInput';
import { useGetPoolManager } from '../../hooks/useGetPoolManager';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { LPair } from '../../types/VaultTypes';
import { UPDATE_GLOBAL_STATE, usePoolInfo, useUpdateRFStates } from '../../contexts/state';
import WarningLimitBox from './WarningLimitBox';
import { TokenAmount } from '../../utils/safe-math';
import { USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

const VaultSetupContainer = ({ data }: any) => {
  const history = useHistory();
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const { vaults } = useVaultsContextProvider();
  const poolInfo = usePoolInfo(data?.mint);
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);
  const PoolManagerFactory = useGetPoolManager(vault);

  const collAccount = useAccountByMint(data.mint);
  const [depositAmount, setDepositAmount] = React.useState(0);

  const depositAmountUSD = new TokenAmount(depositAmount * data.tokenPrice, USDR_MINT_DECIMALS).fixed();

  const [didMount, setDidMount] = React.useState(false);

  const [depositStatus, setDepositStatus] = React.useState(false);
  const [invalidStr, setInvalidStr] = React.useState('');
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const updateRFStates = useUpdateRFStates();

  React.useEffect(() => {
    setDidMount(true);
    setDepositAmount(0);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const depositLP = () => {
    console.log('Depositing', depositAmount, data.value);
    console.log(data.mint);
    if (!(depositAmount && data?.value >= depositAmount)) {
      setDepositStatus(true);
      setInvalidStr('Insufficient funds to deposit!');
      return;
    }
    if (!(collAccount && poolInfo && connected)) {
      setDepositStatus(true);
      setInvalidStr('Invalid  User Collateral account to deposit!');
      return;
    }
    PoolManagerFactory?.depositLP(
      connection,
      wallet,
      vault as LPair,
      depositAmount * Math.pow(10, poolInfo?.mintDecimals ?? 0),
      collAccount?.pubkey.toString() as string
    )
      .then(() => {
        updateRFStates(UPDATE_GLOBAL_STATE, data.mint);
        setDepositAmount(0);
        toast.success('Successfully Deposited!');
        history.push(`/dashboard/vaultdashboard/${data.mint}`);
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        setShow(!show);
        setDepositAmount(0);
        setDepositStatus(false);
      });
  };

  return (
    <div className="vaultsetupcontainer">
      <div className="p-4">
        <p className="vaultsetupcontainer-title">
          Deposit your {data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title} LP
        </p>
        <div className="d-flex justify-content-between align-items-end mt-2">
          <p className="vaultsetupcontainer-label">
            Deposit {data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title} LP
          </p>
          <p className="vaultsetupcontainer-smallLabel">Balance {data.value}</p>
        </div>
        <div className="mt-2">
          <CustomInput
            appendStr="Max"
            initValue={0}
            appendValueStr={data.value}
            tokenStr={`${data.title}`}
            onTextChange={(value) => {
              setDepositAmount(Number(value));
              setDepositStatus(false);
              setButtonDisabled(false);
            }}
            maxValue={data.value}
            valid={depositStatus}
            invalidStr={invalidStr}
            value={depositAmount}
          />
          <p className="vaultsetupcontainer-label mt-2">
            USD: <strong className="vaultsetupcontainer-value">${depositAmountUSD}</strong>
          </p>
        </div>
      </div>
      <div className="vaultsetupcontainer-bottom p-4">
        <div className="d-flex justify-content-between">
          <p className="vaultsetupcontainer-title">Details</p>
        </div>
        <div className="d-flex justify-content-between mt-3">
          <p className="vaultsetupcontainer-label">Outstanding debt</p>
          <strong className="vaultsetupcontainer-value">0.000</strong>
        </div>
        <div>
          <WarningLimitBox />
        </div>
        <div>
          <Button
            disabled={depositAmount <= 0 || buttonDisabled || isNaN(depositAmount)}
            className="button--blue setup"
            onClick={depositLP}
          >
            Set up vault
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VaultSetupContainer;

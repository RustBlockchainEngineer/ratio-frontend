import React, { useMemo } from 'react';
// import { IoIosArrowRoundForward } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { useAccountByMint } from '../../contexts/accounts';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { FetchingStatus } from '../../types/fetching-types';
import { isWalletApproveError } from '../../utils/utils';
import Button from '../Button';
import CustomInput from '../CustomInput';
import { useGetPoolManager } from '../../hooks/useGetPoolManager';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { LPair } from '../../types/VaultTypes';
import { useAppendUserAction, usePoolInfo, useSubscribeTx } from '../../contexts/state';
import WarningLimitBox from './WarningLimitBox';
import { TokenAmount } from '../../utils/safe-math';
import { DEPOSIT_ACTION, USDR_MINT_DECIMALS } from '../../utils/ratio-lending';

const VaultSetupContainer = ({ data }: any) => {
  const history = useHistory();
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const { status, vaults } = useVaultsContextProvider();
  const poolInfo = usePoolInfo(data?.mint);
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);
  const poolManager = useGetPoolManager(vault);

  const collAccount = useAccountByMint(data.mint);
  const [depositAmount, setDepositAmount] = React.useState<any>();

  const depositAmountUSD = new TokenAmount(depositAmount * (data.tokenPrice ?? 0), USDR_MINT_DECIMALS).fixed();

  const [didMount, setDidMount] = React.useState(false);

  const [isDepositing, setIsDepositing] = React.useState(false);
  const [depositStatus, setDepositStatus] = React.useState(false);
  const [invalidStr, setInvalidStr] = React.useState('');
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const appendUserAction = useAppendUserAction();
  const subscribeTx = useSubscribeTx();

  React.useEffect(() => {
    setDidMount(true);
    setDepositAmount(0);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const deposit = async () => {
    try {
      console.log('Depositing', depositAmount);
      if (!(depositAmount && data?.value >= depositAmount)) {
        setDepositStatus(true);
        setInvalidStr('Insufficient funds to deposit!');
        return;
      }
      if (!(collAccount && connected)) {
        setDepositStatus(true);
        setInvalidStr('Invalid  User Collateral account to deposit!');
        return;
      }

      setIsDepositing(true);
      const txHash = await poolManager?.depositLP(
        connection,
        wallet,
        vault as LPair,
        depositAmount * Math.pow(10, poolInfo?.mintDecimals ?? 0),
        collAccount?.pubkey.toString() as string
      );
      subscribeTx(
        txHash,
        () => toast.info('Deposit Transaction Sent'),
        () => toast.success('Deposit Confirmed.'),
        () => toast.error('Deposit Transaction Failed')
      );
      appendUserAction(
        wallet.publicKey.toString(),
        data.mint,
        data.mint,
        DEPOSIT_ACTION,
        -depositAmount,
        txHash,
        poolInfo.fairPrice,
        poolInfo.marketPrice
      );
      history.push(`/dashboard/vaultdashboard/${data.mint}`);
      setDepositAmount(0);
    } catch (err) {
      console.error(err);
      if (isWalletApproveError(err)) toast.warn('Wallet is not approved!');
      else toast.error('Transaction Error!');
    }
    setIsDepositing(false);
  };

  if (status === FetchingStatus.Loading || status === FetchingStatus.NotAsked) {
    return (
      <div className="col allvaults__loading">
        <div className="spinner-border text-info" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vaultsetupcontainer">
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center">
          <p className="vaultsetupcontainer-title">
            Deposit your {data.title === 'USDC-USDR' ? 'USDC-USDr' : data.title} LP
          </p>
          <a
            target="_blank"
            href={poolManager?.getLpLink(data.title)}
            rel="noreferrer"
            className="vaultsetupcontainer-getsaberlp"
          >
            Get Saber LP
          </a>
        </div>
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
              setDepositAmount(value);
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
        <div>
          <WarningLimitBox mint={data.mint} />
        </div>
        <div>
          <Button
            disabled={depositAmount <= 0 || buttonDisabled || isNaN(depositAmount) || isDepositing}
            className="button--blue setup"
            onClick={deposit}
          >
            Set up vault
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VaultSetupContainer;

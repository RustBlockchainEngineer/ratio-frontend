import React, { useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';

import Button from '../Button';
import CustomInput from '../CustomInput';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { useAccountByMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { usePrice } from '../../contexts/price';
import { getUSDrAmount } from '../../utils/risk';
import { toast } from 'react-toastify';
import { IoIosArrowRoundForward } from 'react-icons/io';
import { useGetPoolInfoProvider } from '../../hooks/useGetPoolInfoProvider';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { LPair } from '../../types/VaultTypes';
import { useUpdateRFStates, useUSDrMintInfo, useUserInfo, useVaultMintInfo } from '../../contexts/state';

const VaultSetupContainer = ({ data }: any) => {
  // eslint-disable-next-line
  const { mint: vault_mint } = useParams<{ mint?: string }>();
  const history = useHistory();
  // eslint-disable-next-line
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();

  // eslint-disable-next-line
  const [mintTime, setMintTime] = React.useState('');

  const tokenPrice = usePrice(data.mint);

  const userState = useUserInfo(data.mint);
  const usdrMint = useUSDrMintInfo();
  const collMint = useVaultMintInfo(data.mint);

  const collAccount = useAccountByMint(data.mint);

  const [lockAmount, setLockAmount] = React.useState(0);

  // eslint-disable-next-line
  const [maxUSDrAmount, setMaxUSDrAmount] = React.useState(0);

  const [maxLPAmount, setMaxLockAmount] = React.useState(0);
  const [lpWalletBalance, setLpWalletBalance] = React.useState(0);

  const [lockStatus, setLockStatus] = React.useState(false);

  const { vaults } = useVaultsContextProvider();
  const vaultFound = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);

  const poolInfoProviderFactory = useGetPoolInfoProvider(vaultFound);

  React.useEffect(() => {
    if (userState && tokenPrice && collMint && usdrMint) {
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals);
      const availableAmount = getUSDrAmount(data.riskPercentage, tokenPrice * Number(lpLockedAmount.fixed()));

      const maxAmount = availableAmount - Number(new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed());
      setMaxUSDrAmount(Number(maxAmount.toFixed(usdrMint?.decimals)));
    }
    if (userState) {
      const endDateOfLock = (userState as any).lastMintTime.toNumber() + 3600;
      const unlockDateString = moment(new Date(endDateOfLock * 1000)).format('MM / DD /YYYY HH : MM : SS');

      setMintTime(unlockDateString);
    }
    return () => {
      setMaxUSDrAmount(0);
    };
  }, [tokenPrice, userState, usdrMint, collMint]);

  React.useEffect(() => {
    if (tokenPrice && collMint) {
      const initLPAmount = Number(process.env.REACT_APP_LP_AMOUNT_IN_USD) / tokenPrice;
      setMaxLockAmount(Number(Math.min(initLPAmount, lpWalletBalance).toFixed(collMint?.decimals)));
    }
    return () => {
      setMaxLockAmount(0);
    };
  }, [tokenPrice, lpWalletBalance, collMint]);

  React.useEffect(() => {
    if (wallet && wallet.publicKey && data.mint) {
      if (collAccount && collMint) {
        const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
        setLpWalletBalance(Number(tokenAmount.fixed()));
      }
    }
    return () => {
      setLpWalletBalance(0);
    };
  }, [wallet, collAccount, connection, collMint, data]);

  const updateRFStates = useUpdateRFStates();

  const [didMount, setDidMount] = React.useState(false);
  React.useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const depositLP = () => {
    if (!(lpWalletBalance >= lockAmount && lockAmount > 0)) {
      // toast('Insufficient funds!');
      setLockStatus(true);
      return;
    }
    if (collAccount) {
      //Zhao
      poolInfoProviderFactory
        ?.depositLP(connection, wallet, vaultFound as LPair, lockAmount, collAccount?.pubkey.toString() as string)
        .then(() => {
          updateRFStates(true);
          setShow(false);
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          history.push(`/dashboard/vaultdashboard/${data.mint}`);
          toast('Successfully Deposited!');
          setShow(false);
        });
    }
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
          <p className="vaultsetupcontainer-smallLabel">Balance {lpWalletBalance}</p>
        </div>
        <div className="mt-2">
          <CustomInput
            appendStr="Max"
            initValue={lockAmount.toString()}
            appendValueStr={'' + maxLPAmount}
            tokenStr={`${data.title} LP`}
            onTextChange={(value) => {
              setLockAmount(Number(value));
              setLockStatus(false);
            }}
            maxValue={maxLPAmount}
            valid={lockStatus}
            invalidStr="Insufficient funds!"
          />
          <p className="vaultsetupcontainer-label mt-2">
            USD: <strong className="vaultsetupcontainer-value">$164.21</strong>
          </p>
        </div>
      </div>
      <div className="vaultsetupcontainer-bottom p-4">
        <div className="d-flex justify-content-between">
          <p className="vaultsetupcontainer-title">Details</p>
          <strong className="vaultsetupcontainer-value">0.50%</strong>
        </div>
        <div className="d-flex justify-content-between align-items-start mt-3">
          <p className="vaultsetupcontainer-label">Slippage</p>
          <strong className="vaultsetupcontainer-value">
            <IoIosArrowRoundForward size="25" color="#A5B1B6" />
            300.00%
          </strong>
        </div>
        <div className="d-flex justify-content-between mt-3">
          <p className="vaultsetupcontainer-label">Collateral ratio</p>
          <strong className="vaultsetupcontainer-value">0.00%</strong>
        </div>
        <div className="d-flex justify-content-between mt-3">
          <p className="vaultsetupcontainer-label">Outstanding debt</p>
          <strong className="vaultsetupcontainer-value">
            0.001 DAI
            <IoIosArrowRoundForward size="25" color="#A5B1B6" />
            15,304.82 DAI
          </strong>
        </div>
        <div>
          <Button className="button--fill setup" onClick={depositLP}>
            Set up vault
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VaultSetupContainer;

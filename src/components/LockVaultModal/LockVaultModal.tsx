import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
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
import { useGetPoolManager } from '../../hooks/useGetPoolManager';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { LPair } from '../../types/VaultTypes';
import {
  UPDATE_USER_STATE,
  useUpdateRFStates,
  useUSDrMintInfo,
  useUserInfo,
  usePoolInfo,
  useTokenMintInfo,
} from '../../contexts/state';

const LockVaultModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  // eslint-disable-next-line
  const [mintTime, setMintTime] = React.useState('');

  const tokenPrice = usePrice(data.mint);

  const usdrMint = useUSDrMintInfo();
  const collMint = useTokenMintInfo(data.mint);

  const userState = useUserInfo(data.mint);
  const vault = usePoolInfo(data.mint);

  const collAccount = useAccountByMint(data.mint);

  const [lockAmount, setLockAmount] = React.useState(0);

  // eslint-disable-next-line
  const [maxUSDrAmount, setMaxUSDrAmount] = React.useState(0);

  const [maxLPAmount, setMaxLockAmount] = React.useState(0);
  const [lpWalletBalance, setLpWalletBalance] = useState(0);

  const [lockStatus, setLockStatus] = React.useState(false);

  const { vaults } = useVaultsContextProvider();
  const vaultFound = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);

  const PoolManagerFactory = useGetPoolManager(vaultFound);

  useEffect(() => {
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

  useEffect(() => {
    if (tokenPrice && collMint) {
      const initLPAmount = Number(process.env.REACT_APP_LP_AMOUNT_IN_USD) / tokenPrice;
      setMaxLockAmount(Number(Math.min(initLPAmount, lpWalletBalance).toFixed(collMint?.decimals)));
    }
    return () => {
      setMaxLockAmount(0);
    };
  }, [tokenPrice, lpWalletBalance, collMint]);

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      if (collAccount && collMint) {
        const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
        setLpWalletBalance(Number(tokenAmount.fixed()));
      }
    }
    return () => {
      setLpWalletBalance(0);
    };
  }, [wallet, collAccount, connection, collMint]);

  const updateRFStates = useUpdateRFStates();

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const depositLP = () => {
    PoolManagerFactory?.depositLP(
      connection,
      wallet,
      vault as LPair,
      lockAmount * Math.pow(10, collMint?.decimals ?? 0),
      collAccount?.pubkey.toString() as string
    )
      .then(() => {
        updateRFStates(UPDATE_USER_STATE, data.mint);
        setShow(false);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        toast('Successfully Deposited!');
        setShow(false);
      });
  };

  return (
    <>
      <Button className="button--fill generate" disabled={!connected} onClick={() => setShow(!show)}>
        Deposit LP
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="lockvaultmodal"
      >
        <Modal.Header>
          <div className="lockvaultmodal__footer">
            <IoMdClose size={32} className="lockvaultmodal__header-close" onClick={() => setShow(false)} />
            <div>
              <img src={data?.icons[0]} alt={data?.icons[0]?.toString()} className="lockvaultmodal__header-icon1" />
              <img src={data?.icons[1]} alt={data?.icons[1]?.toString()} className="lockvaultmodal__header-icon2" />
            </div>
            <h3 className="mt-3">Deposit {data.title} LP into vault</h3>
            <label className="lockvaultmodal__label1 mb-2">How much would you like to deposit?</label>
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
            <Button className="button--fill lockBtn" onClick={depositLP}>
              Deposit Assets
            </Button>
          </div>
        </Modal.Header>
      </Modal>
    </>
  );
};

export default LockVaultModal;

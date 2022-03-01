import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import Button from '../Button';
import CustomInput from '../CustomInput';
import { PairType } from '../../models/UInterface';
import ComingSoon from '../ComingSoon';

import riskLevel from '../../assets/images/risklevel.svg';
import highRisk from '../../assets/images/highrisk.svg';
import {
  lockAndMint,
  getTokenVaultByMint,
  USDR_MINT_KEY,
  depositCollateral,
  borrowUSDr,
} from '../../utils/ratio-lending';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { useConnection } from '../../contexts/connection';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../../contexts/wallet';
import { getOneFilteredTokenAccountsByOwner } from '../../utils/web3';
import { useAccountByMint, useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { usePrice } from '../../contexts/price';
import { getUSDrAmount } from '../../utils/risk';
import { toast } from 'react-toastify';
import { sleep } from '../../utils/utils';
import { useUpdateState } from '../../contexts/auth';
import { useGetPoolInfoProvider } from '../../hooks/useGetPoolInfoProvider';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { LPair } from '../../types/VaultTypes';
import { useUSDrMintInfo, useUserInfo, useVaultInfo, useVaultMintInfo } from '../../contexts/state';

type LockVaultModalProps = {
  data: PairType;
};

const LockVaultModal = ({ data }: any) => {
  const history = useHistory();
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  const [mintTime, setMintTime] = React.useState('');

  const tokenPrice = usePrice(data.mint);

  const usdrMint = useUSDrMintInfo();
  const collMint = useVaultMintInfo(data.mint);

  const userState = useUserInfo(data.mint);
  const vault = useVaultInfo(data.mint);

  const collAccount = useAccountByMint(data.mint);

  const [lockAmount, setLockAmount] = React.useState(0);

  const [borrowAmount, setBorrowAmount] = React.useState(0);
  const [maxUSDrAmount, setMaxUSDrAmount] = React.useState(0);

  const [maxLPAmount, setMaxLockAmount] = React.useState(0);
  const [lpWalletBalance, setLpWalletBalance] = useState(0);

  const [mintStatus, setMintStatus] = React.useState(false);
  const [lockStatus, setLockStatus] = React.useState(false);

  const { vaults } = useVaultsContextProvider();
  const vaultFound = useMemo(() => vaults.find((vault) => vault.address_id === (data.mint as string)), [vaults]);

  const poolInfoProviderFactory = useGetPoolInfoProvider(vaultFound);

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

  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const depositLP = () => {
    //zhao
    poolInfoProviderFactory
      ?.depositLP(
        connection,
        wallet,
        vault as LPair,
        lockAmount * Math.pow(10, collMint?.decimals ?? 0),
        collAccount?.pubkey.toString() as string
      )
      .then(() => {
        setUpdateStateFlag(true);
        setShow(false);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        // history.push(`/dashboard/vaultdashboard/${data.mint}`);
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
              <img src={data.icons[0]} alt={data.icons[0].toString()} className="lockvaultmodal__header-icon1" />
              <img src={data.icons[1]} alt={data.icons[1].toString()} className="lockvaultmodal__header-icon2" />
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

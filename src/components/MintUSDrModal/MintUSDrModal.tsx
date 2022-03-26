import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import moment from 'moment';

import Button from '../Button';
import CustomInput from '../CustomInput';

import { borrowUSDr } from '../../utils/ratio-lending';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { useConnection } from '../../contexts/connection';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../../contexts/wallet';
import { useAccountByMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { usePrice } from '../../contexts/price';
import { getUSDrAmount } from '../../utils/risk';
import { toast } from 'react-toastify';
import usdrIcon from '../../assets/images/USDr.png';
import {
  UPDATE_USER_STATE,
  useUpdateRFStates,
  useUSDrMintInfo,
  useUserInfo,
  useVaultMintInfo,
} from '../../contexts/state';

const MintUSDrModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  // eslint-disable-next-line
  const [mintTime, setMintTime] = React.useState('');

  const tokenPrice = usePrice(data.mint);

  const userState = useUserInfo(data.mint);
  const usdrMint = useUSDrMintInfo();
  const collMint = useVaultMintInfo(data.mint);

  const collAccount = useAccountByMint(data.mint);

  const [borrowAmount, setBorrowAmount] = React.useState(0);
  const [maxUSDrAmount, setMaxUSDrAmount] = React.useState(0);

  // eslint-disable-next-line
  const [maxLPAmount, setMaxLockAmount] = React.useState(0);
  const [lpWalletBalance, setLpWalletBalance] = useState(0);

  const [mintStatus, setMintStatus] = React.useState(false);

  // eslint-disable-next-line
  const [lockStatus, setLockStatus] = React.useState(false);
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const [isMinting, setIsMinting] = React.useState(false);

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

  const mintUSDr = async () => {
    try {
      console.log('Minting', borrowAmount);

      if (!(maxUSDrAmount >= borrowAmount && borrowAmount > 0)) {
        setMintStatus(true);
        return;
      }

      setIsMinting(true);

      await borrowUSDr(
        connection,
        wallet,
        borrowAmount * Math.pow(10, usdrMint?.decimals as number),
        new PublicKey(data.mint)
      );

      await updateRFStates(UPDATE_USER_STATE, data.mint);
      toast('Successfully Minted!');
    } catch (err) {
      console.error(err);
      toast.error('Transaction Error!');
    }

    setIsMinting(false);
    setShow(false);
  };

  return (
    <>
      <Button className="button--fill generate" disabled={!connected} onClick={() => setShow(!show)}>
        Mint USDr
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
              <img src={usdrIcon} alt={data.icons[0].toString()} className="lockvaultmodal__header-icon1" />
            </div>
            <h3 className="mt-3">How much USDr would you like to generate?</h3>
            <CustomInput
              appendStr="Max"
              appendValueStr={'' + maxUSDrAmount}
              tokenStr={`USDr`}
              onTextChange={(value) => {
                setBorrowAmount(Number(value));
                setMintStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={maxUSDrAmount}
              valid={mintStatus}
              invalidStr="Amount is invalid to mint USDr!"
            />
            <Button
              disabled={borrowAmount <= 0 || buttonDisabled || isNaN(borrowAmount) || isMinting}
              className="button--fill lockBtn"
              onClick={mintUSDr}
            >
              Mint USDr
            </Button>
          </div>
        </Modal.Header>
      </Modal>
    </>
  );
};

export default MintUSDrModal;

import React, { useEffect, useState } from 'react';
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
  createTokenVault,
  lockAndMint,
  getTokenVaultByMint,
  getUserState,
  USDR_MINT_KEY,
  depositCollateral,
  borrowUSDr,
  getUpdatedUserState,
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

type LockVaultModalProps = {
  data: PairType;
};

const LockVaultModal = ({ data }: any) => {
  const history = useHistory();
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [vault, setVault] = React.useState({});
  const [isCreated, setCreated] = React.useState({});
  const [userState, setUserState] = React.useState(null);
  const [mintTime, setMintTime] = React.useState('');

  const tokenPrice = usePrice(data.mint);
  const collMint = useMint(data.mint);
  const usdrMint = useMint(USDR_MINT_KEY);
  const collAccount = useAccountByMint(data.mint);

  const [lockAmount, setLockAmount] = React.useState(0);

  const [borrowAmount, setBorrowAmount] = React.useState(0);
  const [maxUSDrAmount, setMaxUSDrAmount] = React.useState(0);

  const [maxLPAmount, setMaxLockAmount] = React.useState(0);
  const [lpWalletBalance, setLpWalletBalance] = useState(0);

  useEffect(() => {
    if (userState && tokenPrice && collMint && usdrMint) {
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, collMint?.decimals);
      const availableAmount = getUSDrAmount(data.riskPercentage, tokenPrice * Number(lpLockedAmount.fixed()));

      const maxAmount = availableAmount - Number(new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed());
      setMaxUSDrAmount(Math.ceil(Math.max(maxAmount, 0) * 1000) / 1000);
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
    if (tokenPrice) {
      const initLPAmount = Math.ceil((Number(process.env.REACT_APP_LP_AMOUNT_IN_USD) / tokenPrice) * 1000) / 1000;
      setMaxLockAmount(Math.min(initLPAmount, lpWalletBalance));
    }
    return () => {
      setMaxLockAmount(0);
    };
  }, [tokenPrice, lpWalletBalance]);

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(data.mint)).then((res) => {
        setUserState(res);
      });
      if (collAccount && collMint) {
        const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
        setLpWalletBalance(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
      }
    }
    return () => {
      setLpWalletBalance(0);
    };
  }, [wallet, collAccount, connection, collMint]);

  useEffect(() => {
    if (connected) {
      getTokenVaultByMint(connection, data.mint).then((res) => {
        setVault(res);
        if (res) {
          setCreated(true);
        } else {
          setCreated(false);
        }
      });
    } else {
      setShow(false);
    }
    return () => {
      setCreated(false);
    };
  }, [connection, connected]);

  const { updateStateFlag, setUpdateStateFlag } = useUpdateState();
  useEffect(() => {
    if (updateStateFlag && wallet?.publicKey) {
      getUpdatedUserState(connection, wallet, data.mint, userState).then((res) => {
        setUserState(res);
        setUpdateStateFlag(false);
      });
    }
  }, [updateStateFlag]);

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const depositLP = () => {
    if (!(lpWalletBalance >= lockAmount && lockAmount > 0)) {
      toast('Insufficient funds!');
      return;
    }
    if (collAccount) {
      depositCollateral(
        connection,
        wallet,
        lockAmount * Math.pow(10, collMint?.decimals as number),
        collAccount.pubkey.toString(),
        new PublicKey(data.mint)
      )
        .then(() => {
          setUpdateStateFlag(true);
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          // history.push(`/dashboard/vaultdashboard/${data.mint}`);
        });
    }
  };

  const mintUSDr = () => {
    if (!(maxUSDrAmount >= borrowAmount && borrowAmount > 0)) {
      toast('Amount is invalid to mint USDr!');
      return;
    }

    borrowUSDr(connection, wallet, borrowAmount * Math.pow(10, usdrMint?.decimals as number), new PublicKey(data.mint))
      .then(() => {
        setUpdateStateFlag(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        // history.push(`/dashboard/vaultdashboard/${data.mint}`);
      });
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
              <img src={data.icons[0]} alt={data.icons[0].toString()} className="lockvaultmodal__header-icon1" />
              <img src={data.icons[1]} alt={data.icons[1].toString()} className="lockvaultmodal__header-icon2" />
            </div>
            <h3 className="mt-3">Deposit {data.title} LP into vault</h3>
            <label className="lockvaultmodal__label1 mb-2">How much would you like to lock up?</label>
            <CustomInput
              appendStr="Max"
              initValue={'0'}
              appendValueStr={'' + maxLPAmount}
              tokenStr={`${data.title} LP`}
              onTextChange={(value) => setLockAmount(Number(value))}
              maxValue={maxLPAmount}
            />
            <Button className="button--fill lockBtn" onClick={() => depositLP()}>
              Deposit Assets
            </Button>
          </div>
        </Modal.Header>
        {/* <Modal.Body>
          <ComingSoon enable>
            <div className="lockvaultmodal__body">
              <div className="d-flex justify-content-between">
                <div className="lockvaultmodal__body-label">APR:</div>
                <div className="lockvaultmodal__body-value">125%</div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <div className="lockvaultmodal__body-label">
                  Risk level:
                  <img src={riskLevel} alt="risklevel" />
                </div>
                <div className="lockvaultmodal__body-red">
                  <img src={highRisk} alt="highrisk" className="mr-1" />
                  92%
                </div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <div className="lockvaultmodal__body-label">Vault Value:</div>
                <div className="lockvaultmodal__body-value opacity-5">?</div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <div className="lockvaultmodal__body-label">Baseline Overcollateralization:</div>
                <div className="lockvaultmodal__body-value opacity-5">?</div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <div className="lockvaultmodal__body-label">Liquidation Ratio:</div>
                <div className="lockvaultmodal__body-value opacity-5">?</div>
              </div>
            </div>
          </ComingSoon>
        </Modal.Body> */}
        <Modal.Footer>
          <div className="lockvaultmodal__footer">
            {/* <label className="lockvaultmodal__label2">
              Available to mint after <strong>{mintTime}</strong>
            </label> */}

            <label className="lockvaultmodal__label1">How much USDr would you like to generate?</label>
            <label className="lockvaultmodal__label2">
              Min: <strong>1 USDr</strong>, Max: <strong>1000 USDr</strong>
            </label>
            <CustomInput
              appendStr="Max"
              appendValueStr={'' + maxUSDrAmount}
              tokenStr={`USDr`}
              onTextChange={(value) => setBorrowAmount(Number(value))}
              maxValue={maxUSDrAmount}
            />
            <Button className="button--fill lockBtn" onClick={() => mintUSDr()}>
              Mint USDr
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LockVaultModal;

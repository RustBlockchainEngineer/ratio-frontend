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
} from '../../utils/ratio-lending';

import { useConnection } from '../../contexts/connection';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../../contexts/wallet';
import { getOneFilteredTokenAccountsByOwner } from '../../utils/web3';
import { useAccountByMint, useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';
import { usePrice } from '../../contexts/price';
import { getUSDrAmount } from '../../utils/risk';
import { toast } from 'react-toastify';

type LockVaultModalProps = {
  data: PairType;
};

const LockVaultModal = ({ data }: LockVaultModalProps) => {
  const history = useHistory();
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();

  const [vault, setVault] = React.useState({});
  const [isCreated, setCreated] = React.useState({});
  const [userState, setUserState] = React.useState({});
  const [mintTime, setMintTime] = React.useState('');

  const [lpAmount, setLPAmount] = React.useState(0);
  const [usdrAmount, setUSDrAmount] = React.useState(0);
  const [maxUSDrAmount, setMaxUSDrAmount] = React.useState(0);
  const tokenPrice = usePrice(data.mint);
  const [initCollAmount, setInitCollAmount] = React.useState(0);
  const collMint = useMint(data.mint);
  const usdrMint = useMint(USDR_MINT_KEY);

  const collAccount = useAccountByMint(data.mint);
  const [collBalance, setCollBalance] = useState(0);

  const [disableDeposit, setDisableDeposit] = useState(false);

  useEffect(() => {
    if (userState) {
      const lpLockedAmount = new TokenAmount((userState as any).lockedCollBalance, usdrMint?.decimals);
      const totalUSDr = getUSDrAmount(data.riskPercentage, tokenPrice * Number(lpLockedAmount.fixed()));
      const maxAmount = totalUSDr - Number(new TokenAmount((userState as any).debt, usdrMint?.decimals).fixed());
      setMaxUSDrAmount(Math.ceil(maxAmount * 1000) / 1000);
    }
  }, [tokenPrice, userState]);

  useEffect(() => {
    if (tokenPrice) {
      const initLPAmount = Math.ceil((10 / tokenPrice) * 1000) / 1000;
      console.log('Risk', data.riskPercentage);
      // setMaxUSDrAmount(Math.ceil(getUSDrAmount(data.riskPercentage, tokenPrice * initLPAmount) * 1000) / 1000);
      setInitCollAmount(initLPAmount);
    }
  }, [tokenPrice]);

  useEffect(() => {
    if (wallet && wallet.publicKey) {
      getUserState(connection, wallet, new PublicKey(data.mint)).then((res) => {
        setUserState(res);
        if (res) {
          const endDateOfLock = res.lastMintTime.toNumber() + 3600;
          const unlockDateString = moment(new Date(endDateOfLock * 1000)).format('MM/DD/YYYY HH:MM:SS');

          setMintTime(unlockDateString);
        }
      });
      if (collAccount) {
        const tokenAmount = new TokenAmount(collAccount.info.amount + '', collMint?.decimals);
        setCollBalance(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
      }
    }
  }, [wallet, collAccount, connection, collMint]);

  useEffect(() => {
    getTokenVaultByMint(connection, data.mint).then((res) => {
      setVault(res);
      if (res) {
        setCreated(true);
      } else {
        setCreated(false);
      }
    });
  }, [connection]);

  // useEffect(() => {
  //   setDisableDeposit(!(collBalance >= lpAmount && lpAmount > 0 && maxUSDrAmount >= usdrAmount));
  // }, [collBalance, lpAmount, usdrAmount, maxUSDrAmount]);

  const depositAndBorrow = () => {
    if (!(collBalance >= lpAmount && lpAmount > 0 && maxUSDrAmount >= usdrAmount)) {
      toast('Amount is invalid to lock & mint!');
      return;
    }
    if (collAccount) {
      lockAndMint(
        connection,
        wallet,
        lpAmount * Math.pow(10, collMint?.decimals as number),
        usdrAmount * Math.pow(10, usdrMint?.decimals as number),
        collAccount.pubkey.toString(),
        new PublicKey(data.mint)
      )
        .then(() => {})
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          history.push(`/dashboard/vaultdashboard/${data.mint}`);
        });
    }
  };

  const depositLP = () => {
    if (!(collBalance >= lpAmount && lpAmount > 0)) {
      toast('Amount is invalid to lock LP token!');
      return;
    }
    if (collAccount) {
      depositCollateral(
        connection,
        wallet,
        lpAmount * Math.pow(10, collMint?.decimals as number),
        collAccount.pubkey.toString(),
        new PublicKey(data.mint)
      )
        .then(() => {})
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          // history.push(`/dashboard/vaultdashboard/${data.mint}`);
        });
    }
  };

  const mintUSDr = () => {
    if (!(maxUSDrAmount >= usdrAmount)) {
      toast('Amount is invalid to mint USDR!');
      return;
    }
    borrowUSDr(connection, wallet, usdrAmount * Math.pow(10, usdrMint?.decimals as number), new PublicKey(data.mint))
      .then(() => {})
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        // history.push(`/dashboard/vaultdashboard/${data.mint}`);
      });
  };

  return (
    <>
      <Button className="button--fill generate" onClick={() => setShow(!show)}>
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
            <h3>Lock {data.title}-LP into vault</h3>
            <label className="lockvaultmodal__label1 mb-2">How much would you like to lock up?</label>
            <CustomInput
              appendStr="Max"
              initValue={'' + initCollAmount}
              appendValueStr={'' + collBalance}
              tokenStr={`${data.title} LP`}
              onTextChange={(value) => setLPAmount(Number(value))}
            />
            <Button className="button--fill lockBtn" onClick={() => depositLP()} disabled={disableDeposit}>
              Lock Assets
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <div className="lockvaultmodal__footer">
            <label className="lockvaultmodal__label2">
              Available to mint: <strong>{mintTime}</strong>
            </label>

            <label className="lockvaultmodal__label1">How much USDr would you like to generate?</label>
            <label className="lockvaultmodal__label2">
              Min: <strong>1 USDr</strong>, Max: <strong>1000 USDr</strong>
            </label>
            <CustomInput
              appendStr="Max"
              appendValueStr={'' + maxUSDrAmount}
              tokenStr={`USDr`}
              onTextChange={(value) => setUSDrAmount(Number(value))}
            />
            <Button className="button--fill lockBtn" onClick={() => mintUSDr()} disabled={disableDeposit}>
              Mint USDr
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LockVaultModal;

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
} from '../../utils/ratio-lending';

import { useConnection } from '../../contexts/connection';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../../contexts/wallet';
import { getOneFilteredTokenAccountsByOwner } from '../../utils/web3';
import { useAccountByMint, useMint } from '../../contexts/accounts';
import { TokenAmount } from '../../utils/safe-math';

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

  const collMint = useMint(data.mint);
  const usdrMint = useMint(USDR_MINT_KEY);

  const collAccount = useAccountByMint(data.mint);
  const [collAmount, setCollAmount] = useState(0);

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
        setCollAmount(Math.ceil(parseFloat(tokenAmount.fixed()) * 100) / 100);
      }
    }
  });

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

  const depositAndBorrow = () => {
    if (collAccount && collAmount > 0) {
      lockAndMint(
        connection,
        wallet,
        0.429 * Math.pow(10, collMint?.decimals as number),
        10 * Math.pow(10, usdrMint?.decimals as number),
        collAccount.pubkey.toString(),
        new PublicKey(data.mint)
      )
        .then(() => {})
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          history.push('/dashboard/vaultdashboard' + '?mint=' + data.mint);
        });
    }
  };

  return (
    <>
      {/* {!isCreated ? (
        <Button
          className="button--fill generate"
          onClick={() => createTokenVault(connection, wallet, new PublicKey(data.mint))}
        >
          Create Vault
        </Button>
      ) : (
        <Button className="button--fill generate" onClick={() => setShow(!show)}>
          Mint USDr
        </Button>
      )} */}

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
          <div className="lockvaultmodal__header">
            <IoMdClose size={32} className="lockvaultmodal__header-close" onClick={() => setShow(false)} />
            <div>
              <img src={data.icons[0]} alt={data.icons[0].toString()} className="lockvaultmodal__header-icon1" />
              <img src={data.icons[1]} alt={data.icons[1].toString()} className="lockvaultmodal__header-icon2" />
            </div>
            <h3>Lock {data.title}-LP into vault</h3>
            <label className="lockvaultmodal__label1 mb-2">How much would you like to lock up?</label>
            <CustomInput appendStr="Max" appendValueStr="1000" tokenStr={`${data.title} LP`} />
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
            <CustomInput appendStr="Max" appendValueStr="1000" tokenStr={`USDr`} />
            <Button className="button--fill lockBtn" onClick={() => depositAndBorrow()}>
              Lock Assets & Mint USDr
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LockVaultModal;

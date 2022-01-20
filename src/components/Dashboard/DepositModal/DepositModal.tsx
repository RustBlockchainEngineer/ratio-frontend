import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { toast } from 'react-toastify';
import { useAccountByMint, useMint } from '../../../contexts/accounts';
import { useUpdateState } from '../../../contexts/auth';
import { useConnection } from '../../../contexts/connection';
import { usePrice } from '../../../contexts/price';
import { useWallet } from '../../../contexts/wallet';
import { depositCollateral, getTokenVaultByMint, getUserState } from '../../../utils/ratio-lending';
import { TokenAmount } from '../../../utils/safe-math';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';
import Button from '../../Button';
import CustomInput from '../../CustomInput';

type PairType = {
  mint: string;
  icons: Array<string>;
  title: string;
};

type DepositModalProps = {
  data: PairType;
};

const DepositModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const collMint = useMint(data.mint);

  const collAccount = useAccountByMint(data.mint);
  const [depositAmount, setDepositAmount] = React.useState(0);

  const [didMount, setDidMount] = React.useState(false);
  const { setUpdateStateFlag } = useUpdateState();
  const [depositStatus, setDepositStatus] = React.useState(false);
  const [invalidStr, setInvalidStr] = React.useState('');

  // useEffect(() => {
  //   setDidMount(true);
  //   setDepositAmount(0);
  //   return () => setDidMount(false);
  // }, []);

  // if (!didMount) {
  //   return null;
  // }

  const deposit = () => {
    console.log('Depositing', depositAmount, data.value);
    console.log(data.mint);
    if (!(depositAmount && data.value >= depositAmount)) {
      setDepositStatus(true);
      setInvalidStr('Insufficient funds to deposit!');
      return;
    }
    if (!(collAccount && collMint && connected)) {
      setDepositStatus(true);
      setInvalidStr('Invalid  User Collateral account to deposit!');
      return;
    }
    depositCollateral(
      connection,
      wallet,
      depositAmount * Math.pow(10, collMint?.decimals),
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
        toast('Successfully Deposited!');
        setShow(false);
      });
  };
  return (
    <div className="dashboardModal">
      <Button className="button--fill fillBtn" onClick={() => setShow(!show)}>
        Deposit
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="dashboardModal__modal"
      >
        <Modal.Header>
          <div className="dashboardModal__modal__header">
            <IoMdClose size={32} className="dashboardModal__modal__header-close" onClick={() => setShow(false)} />
            <div>
              {data.icons ? (
                <>
                  <img src={data.icons[0]} alt={data.icons[0].toString()} />
                  <img
                    src={data.icons[1]}
                    alt={data.icons[1].toString()}
                    className="dashboardModal__modal__header-icon"
                  />
                </>
              ) : (
                <>
                  <img />
                  <img className="dashboardModal__modal__header-icon" />
                </>
              )}
            </div>
            <h4>Deposit assets into vault</h4>
            <h5>
              Deposit more <strong>{data.title}</strong> into your vault
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">How much would you like to deposit?</label>
            <CustomInput
              appendStr="Max"
              initValue={'0'}
              appendValueStr={data.value}
              tokenStr={`${data.title}`}
              onTextChange={(value) => {
                setDepositAmount(Number(value));
                setDepositStatus(false);
              }}
              maxValue={data.value}
              valid={depositStatus}
              invalidStr={invalidStr}
            />
            <Button className="button--fill bottomBtn" onClick={() => deposit()}>
              Deposit & Lock Assets
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DepositModal;

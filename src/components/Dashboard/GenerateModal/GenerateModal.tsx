import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { borrowUSDr } from '../../../utils/ratio-lending';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import moment from 'moment';
import { toast } from 'react-toastify';
import { UPDATE_USER_STATE, useUpdateRFStates, useUSDrMintInfo, useUserInfo } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';
import { postToRatioApi } from '../../../utils/ratioApi';

const GenerateModal = ({ data }: any) => {
  const [show, setShow] = useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();
  // eslint-disable-next-line
  const [mintTime, setMintTime] = useState('');

  const userState = useUserInfo(data.mint);
  const usdrMint = useUSDrMintInfo();

  const [borrowAmount, setBorrowAmount] = useState(0);
  const updateRFStates = useUpdateRFStates();
  const [mintStatus, setMintStatus] = useState(false);
  const [invalidStr, setInvalidStr] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const [isMinting, setIsMinting] = useState(false);
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    if (userState) {
      const endDateOfLock = userState.lastMintTime.toNumber() + 3600;
      const unlockDateString = moment(new Date(endDateOfLock * 1000)).format('MM / DD /YYYY HH : MM : SS');

      setMintTime(unlockDateString);
    }
    return () => {
      setMintTime('');
    };
  }, [userState]);

  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const borrow = async () => {
    try {
      console.log('Borrowing USDr', borrowAmount);
      // FixMe: Let's ignore this at the moment.
      // If this is really necessary, we should add some codes on contract also.
      /*if (borrowAmount < 10) {
        setMintStatus(true);
        setInvalidStr('You must mint at least 10 USDr');
        return;
      }*/
      if (!(borrowAmount > 0 && borrowAmount <= data.usdrValue)) {
        setMintStatus(true);
        setInvalidStr('Amount is invalid to generate USDr!');
        return;
      }
      if (!usdrMint) {
        setMintStatus(true);
        setInvalidStr('Invalid USDr Mint address to generate!');
        return;
      }

      setIsMinting(true);

      const txtSignature = await borrowUSDr(
        connection,
        wallet,
        borrowAmount * Math.pow(10, usdrMint.decimals),
        new PublicKey(data.mint)
      );

      const response = await postToRatioApi(
        {
          tx_type: 'borrow',
          signature: txtSignature,
        },
        `/transaction/${wallet?.publicKey?.toBase58()}/new`
      );

      console.log('Response from backend', response);
      await updateRFStates(UPDATE_USER_STATE, data.mint);
      toast.success('Successfully minted USDr tokens!');
    } catch (err) {
      console.error(err);
      if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
      else toast.error('Transaction Error!');
    }
    borrowUSDr(connection, wallet, borrowAmount * Math.pow(10, usdrMint.decimals), new PublicKey(data.mint))
      .then((txSignature: string) => {
        updateRFStates(UPDATE_USER_STATE, data.mint);
        toast.success('Successfully minted USDr tokens!');
        postToRatioApi(
          {
            tx_type: 'borrow',
            address_id: data.mint,
            signature: txSignature,
          },
          `/transaction/${wallet?.publicKey.toBase58()}/new`
        )
          .then((res: string) => {
            console.log('RES FROM BACKEND', res);
          })
          .catch((error: any) => {
            console.error('ERROR FROM BACKEND', error);
            throw error;
          });
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        setShow(!show);
      });

    setIsMinting(false);
    setShow(false);
  };

  return (
    <div className="dashboardModal">
      <Button className="button--blue fillBtn" onClick={() => setShow(!show)}>
        Mint
      </Button>
      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setButtonDisabled(true);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="dashboardModal__modal"
      >
        <Modal.Header>
          <div className="dashboardModal__modal__header">
            <IoMdClose
              size={32}
              className="dashboardModal__modal__header-close"
              onClick={() => {
                setButtonDisabled(true);
                setShow(false);
              }}
            />
            <div>
              <img src={data?.icons[0]} alt={data?.icons[0]?.toString()} />
            </div>
            <h4>Mint more USDr</h4>
            <h5>
              Mint up to <strong>{data.usdrValue} USDr</strong>
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">How much would you like to mint?</label>
            <CustomInput
              appendStr="Max"
              initValue={'0'}
              appendValueStr={'' + data.usdrValue}
              tokenStr={`USDr`}
              onTextChange={(value) => {
                setBorrowAmount(Number(value));
                setMintStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={data.usdrValue}
              valid={mintStatus}
              invalidStr={invalidStr}
            />
            {/* <label className="lockvaultmodal__label2">
              Available to mint after <strong>{mintTime}</strong>
            </label>
            <p className="dashboardModal__modal__body-red">
              There will be a 2% stability fee associated with this transaction.
            </p> */}
            <Button
              disabled={borrowAmount <= 0 || buttonDisabled || isNaN(borrowAmount) || isMinting}
              className="button--blue bottomBtn"
              onClick={borrow}
            >
              Mint USDr
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GenerateModal;

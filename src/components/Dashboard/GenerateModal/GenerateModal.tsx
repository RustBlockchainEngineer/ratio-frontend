import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { usePrice } from '../../../contexts/price';
import { useWallet } from '../../../contexts/wallet';
import { borrowUSDr, getTokenVaultByMint, getUserState } from '../../../utils/ratio-lending';
import { getUSDrAmount } from '../../../utils/risk';
import { TokenAmount } from '../../../utils/safe-math';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useUpdateRFStates, useUSDrMintInfo, useUserInfo } from '../../../contexts/state';

type PairType = {
  mint: string;
  icons: Array<string>;
  usdrValue: string;
};

type GenerateModalProps = {
  data: PairType;
};

const GenerateModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const [vault, setVault] = React.useState({});
  const [mintTime, setMintTime] = React.useState('');

  const userState = useUserInfo(data.mint);
  const usdrMint = useUSDrMintInfo();

  const [borrowAmount, setBorrowAmount] = React.useState(0);
  const updateRFStates = useUpdateRFStates();
  const [mintStatus, setMintStatus] = React.useState(false);
  const [invalidStr, setInvalidStr] = React.useState('');
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

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

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const borrow = () => {
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
    borrowUSDr(connection, wallet, borrowAmount * Math.pow(10, usdrMint.decimals), new PublicKey(data.mint))
      .then((tx) => {
        console.log('Success Generate txid=', tx);
        updateRFStates(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setShow(!show);
        toast('Successfully minted USDr tokens!');
      });
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
              <img src={data.icons[0]} alt={data.icons[0].toString()} />
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
              disabled={borrowAmount <= 0 || buttonDisabled || isNaN(borrowAmount)}
              className="button--blue bottomBtn"
              onClick={() => borrow()}
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

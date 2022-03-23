import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { PublicKey } from '@solana/web3.js';
import { repayUSDr } from '../../../utils/ratio-lending';
import { useMint } from '../../../contexts/accounts';
import { toast } from 'react-toastify';
import { UPDATE_USER_STATE, useUpdateRFStates } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';
import { postToRatioApi } from '../../../utils/ratioApi';

const PaybackModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();
  const usdrMint = useMint(data.usdrMint);

  const [paybackAmount, setPayBackAmount] = React.useState(Number(data.usdrValue));
  const updateRFStates = useUpdateRFStates();

  const [paybackStatus, setPaybackStatus] = React.useState(false);
  const [invalidStr, setInvalidStr] = React.useState('');
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const [didMount, setDidMount] = React.useState(false);
  useEffect(() => {
    setDidMount(true);
    if (paybackAmount > 0) {
      setPaybackStatus(false);
    } else {
      setPayBackAmount(0);
    }
    return () => setDidMount(false);
  }, [paybackAmount]);

  if (!didMount) {
    return null;
  }

  const repay = () => {
    console.log('PayBack', paybackAmount);
    if (!(paybackAmount && data.usdrValue >= paybackAmount)) {
      setPaybackStatus(true);
      setInvalidStr('Insufficient funds to payback!');
      return;
    }
    if (!usdrMint) {
      setPaybackStatus(true);
      setInvalidStr('Invalid USDr Mint address to payback!');
      return;
    }
    repayUSDr(connection, wallet, paybackAmount * Math.pow(10, usdrMint.decimals), new PublicKey(data.mint))
      .then((txSignature: string) => {
        updateRFStates(UPDATE_USER_STATE, data.mint);
        setPayBackAmount(0);
        toast.success('Successfully Paid back!');
        postToRatioApi(
          {
            tx_type: 'payback',
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
        setShow(false);
      });
  };

  return (
    <div className="dashboardModal">
      <Button className="gradientBtn" onClick={() => setShow(!show)}>
        Pay Back
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
            <h4>Pay back USDr debt</h4>
            <h5>
              You owe &nbsp;
              <span className="dashboardModal__modal__header-red">{data.usdrValue} USDr </span>. Pay back some or all of
              your debt below.
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">How much would you like to pay back?</label>
            <CustomInput
              appendStr="Max"
              // initValue={'0'}
              appendValueStr={'' + data.usdrValue}
              tokenStr={`USDr`}
              onTextChange={(value) => {
                setPayBackAmount(Number(value));
                setPaybackStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={data.usdrValue}
              valid={paybackStatus}
              invalidStr={invalidStr}
            />
            {/* <label className="dashboardModal__modal__label mt-3">Estimated token value</label>
            <CustomDropDownInput /> */}
            <Button
              disabled={paybackAmount <= 0 || buttonDisabled || isNaN(paybackAmount)}
              className="button--blue bottomBtn"
              onClick={() => repay()}
            >
              Pay Back USDr
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PaybackModal;

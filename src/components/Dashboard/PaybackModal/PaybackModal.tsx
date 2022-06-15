import React, { useEffect, useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { PublicKey } from '@solana/web3.js';
import { PAYBACK_ACTION, repayUSDr, USDR_MINT_DECIMALS, USDR_MINT_KEY } from '../../../utils/ratio-lending';
import { toast } from 'react-toastify';
import AmountSlider from '../AmountSlider';
import { isWalletApproveError } from '../../../utils/utils';
// import { postToRatioApi } from '../../../utils/ratioApi';
import { useAppendUserAction, usePoolInfo, useSubscribeTx } from '../../../contexts/state';

const PaybackModal = ({ data }: any) => {
  const maxPaybackAmount = Math.min(data.usdrValue, data.debtValue);

  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [show, setShow] = useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();

  const [paybackAmount, setPayBackAmount] = useState<any>();
  const [paybackStatus, setPaybackStatus] = useState(false);
  const [invalidStr, setInvalidStr] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const [didMount, setDidMount] = useState(false);

  const [isPayingBack, setIsPayingBack] = useState(false);
  const [amountValue, setAmountValue] = useState(0);

  const appendUserAction = useAppendUserAction();
  const subscribeTx = useSubscribeTx();
  const poolInfo = usePoolInfo(data?.mint);

  useEffect(() => {
    setDidMount(true);
    if (paybackAmount > 0) {
      setPaybackStatus(false);
    } else {
      setPayBackAmount('');
    }
    return () => setDidMount(false);
  }, [paybackAmount]);

  if (!didMount) {
    return null;
  }

  const repay = async () => {
    console.log('PayBack', paybackAmount);
    if (!(paybackAmount && maxPaybackAmount >= paybackAmount)) {
      setPaybackStatus(true);
      setInvalidStr('Insufficient funds to payback!');
      return;
    }

    setIsPayingBack(true);

    repayUSDr(connection, wallet, paybackAmount * Math.pow(10, USDR_MINT_DECIMALS), new PublicKey(data.mint))
      .then((txHash: string) => {
        subscribeTx(
          txHash,
          () => toast.info('Repay Transaction Sent'),
          () => toast.success('Repay Confirmed.'),
          () => toast.error('Repay Transaction Failed')
        );
        appendUserAction(
          wallet.publicKey.toString(),
          data.mint,
          USDR_MINT_KEY,
          PAYBACK_ACTION,
          -paybackAmount,
          txHash,
          poolInfo.fairPrice,
          poolInfo.marketPrice
        );
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        setIsPayingBack(false);
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
        data-theme={darkMode ? 'dark' : 'light'}
        onEntered={() => {
          setAmountValue(0);
          setPayBackAmount('');
          setPaybackStatus(false);
          setButtonDisabled(false);
        }}
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
              <span className="dashboardModal__modal__header-red">{data.debtValue} USDr </span>. Pay back some or all of
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
              appendValueStr={'' + maxPaybackAmount}
              tokenStr={`USDr`}
              onTextChange={(value: any) => {
                setAmountValue((value / maxPaybackAmount) * 100);
                setPayBackAmount(value);
                setPaybackStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={maxPaybackAmount}
              valid={paybackStatus}
              invalidStr={invalidStr}
              value={paybackAmount}
            />
            <AmountSlider
              onChangeValue={(value: any) => {
                setPayBackAmount(Number(maxPaybackAmount * (value / 100)).toFixed(2));
                setAmountValue(value);
                setPaybackStatus(false);
                setButtonDisabled(false);
              }}
              value={amountValue}
            />
            <Button
              disabled={paybackAmount <= 0 || buttonDisabled || isNaN(paybackAmount) || isPayingBack}
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

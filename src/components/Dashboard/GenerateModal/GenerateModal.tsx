import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { borrowUSDr, USDR_MINT_DECIMALS, USDR_MINT_KEY } from '../../../utils/ratio-lending';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import AmountSlider from '../AmountSlider';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useUserVaultInfo } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';
import { postToRatioApi } from '../../../utils/ratioApi';

const GenerateModal = ({ data }: any) => {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [show, setShow] = useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();
  // eslint-disable-next-line
  const [mintTime, setMintTime] = useState('');

  const userState = useUserVaultInfo(data.mint);

  const [borrowAmount, setBorrowAmount] = useState<any>();

  const [mintStatus, setMintStatus] = useState(false);
  const [invalidStr, setInvalidStr] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(true);

  const [isMinting, setIsMinting] = useState(false);
  const [didMount, setDidMount] = useState(false);
  const [amountValue, setAmountValue] = useState(0);

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
    setBorrowAmount('');
    return () => setDidMount(false);
  }, []);

  if (!didMount) {
    return null;
  }

  const borrow = async () => {
    console.log('borrowAmount', borrowAmount);
    if (!(borrowAmount > 0 && borrowAmount <= data.usdrValue)) {
      setMintStatus(true);
      setInvalidStr('Amount is invalid to generate USDr!');
      return;
    }

    setIsMinting(true);
    borrowUSDr(connection, wallet, borrowAmount * 10 ** USDR_MINT_DECIMALS, new PublicKey(data.mint))
      .then((txSignature: string) => {
        toast.success('Successfully minted USDr tokens!');
        postToRatioApi(
          {
            tx_type: 'borrow',
            address_id: USDR_MINT_KEY,
            signature: txSignature,
            vault_address: new PublicKey(data.mint),
          },
          `/transaction/${wallet?.publicKey.toBase58()}/new`
        )
          .then((res: string) => {
            console.log('RES FROM BACKEND', res);
          })
          .catch((error: any) => {
            console.error('ERROR FROM BACKEND', error);
            // throw error;
          });
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        setIsMinting(false);
        setShow(false);
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
        onEntered={() => {
          setBorrowAmount('');
          setAmountValue(0);
          setMintStatus(false);
          setButtonDisabled(false);
        }}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="dashboardModal__modal"
        data-theme={darkMode ? 'dark' : 'light'}
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
              initValue={0}
              appendValueStr={'' + data.usdrValue}
              tokenStr={`USDr`}
              onTextChange={(value: any) => {
                setAmountValue((value / data.usdrValue) * 100);
                setBorrowAmount(value);
                setMintStatus(false);
                setButtonDisabled(false);
              }}
              maxValue={data.usdrValue}
              valid={mintStatus}
              invalidStr={invalidStr}
              value={borrowAmount}
            />
            <AmountSlider
              onChangeValue={(value) => {
                setBorrowAmount(Number(data.usdrValue * (value / 100)).toFixed(2));
                setAmountValue(value);
                setMintStatus(false);
                setButtonDisabled(false);
              }}
              value={amountValue}
            />
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

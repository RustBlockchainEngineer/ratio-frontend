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
import { useUpdateState } from '../../../contexts/auth';

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

  const usdrMint = useMint(data.usdrMint);
  const [borrowAmount, setBorrowAmount] = React.useState(0);
  const { setUpdateStateFlag } = useUpdateState();

  useEffect(() => {
    if (wallet && wallet.publicKey && data.mint) {
      getUserState(connection, wallet, new PublicKey(data.mint)).then((res) => {
        if (res) {
          const endDateOfLock = res.lastMintTime.toNumber() + 3600;
          const unlockDateString = moment(new Date(endDateOfLock * 1000)).format('MM / DD /YYYY HH : MM : SS');

          setMintTime(unlockDateString);
        }
      });
    }
    return () => {
      setMintTime('');
    };
  }, [wallet, connection]);

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
    if (!(borrowAmount > 0 && borrowAmount <= data.usdrValue)) {
      return toast('Amount is invalid to generate USDr!');
    }
    if (!usdrMint) {
      return toast('Invalid USDr Mint address to generate!');
    }
    borrowUSDr(connection, wallet, borrowAmount * Math.pow(10, usdrMint.decimals), new PublicKey(data.mint))
      .then((tx) => {
        console.log('Success Generate txid=', tx);
        setUpdateStateFlag(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setShow(!show);
        toast('Successfully minted LP tokens!');
      });
  };

  return (
    <div className="dashboardModal">
      <Button className="gradientBtn" onClick={() => setShow(!show)}>
        Mint
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
              <img src={data.icons[0]} alt={data.icons[0].toString()} />
            </div>
            <h4>Generate more USDr</h4>
            <h5>
              Generate up to <strong>{data.usdrValue} USDr</strong>
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
              onTextChange={(value) => setBorrowAmount(Number(value))}
            />
            <label className="lockvaultmodal__label2">
              Available to mint after <strong>{mintTime}</strong>
            </label>
            <p className="dashboardModal__modal__body-red">
              There will be a 2% stability fee associated with this transaction.
            </p>
            <Button className="button--fill bottomBtn" onClick={() => borrow()}>
              Mint USDr
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GenerateModal;

import { PublicKey } from '@solana/web3.js';
import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useMint } from '../../../contexts/accounts';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { borrowUSDr, getTokenVaultByMint } from '../../../utils/ratio-lending';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';
import Button from '../../Button';
import CustomInput from '../../CustomInput';

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
  const { wallet } = useWallet();
  const [vault, setVault] = React.useState({});
  const [isCreated, setCreated] = React.useState({});
  const usdrMint = useMint(data.usdrMint);

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

  const borrow = () => {
    if (usdrMint) {
      borrowUSDr(connection, wallet, 10 * Math.pow(10, usdrMint.decimals), new PublicKey(data.mint))
        .then(() => {})
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setShow(!show);
        });
    }
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
            <CustomInput appendStr="Max" appendValueStr="32.34" tokenStr="USDr" />
            <p className="dashboardModal__modal__body-red">
              There will be a 2% stability fee associated with this transaction.
            </p>
            <Button className="button--fill bottomBtn" onClick={() => borrow()}>
              Pay USDr Debt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GenerateModal;

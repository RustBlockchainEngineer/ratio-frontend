import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import Button from '../../Button';
import CustomInput from '../../CustomInput';
import CustomDropDownInput from '../../CustomDropDownInput';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { getOneFilteredTokenAccountsByOwner } from '../../../utils/web3';
import { PublicKey } from '@solana/web3.js';
import { getUsdrMintKey, repayUSDr, USDR_MINT_KEY } from '../../../utils/ratio-lending';
import { useMint } from '../../../contexts/accounts';

type PairType = {
  icons: Array<string>;
  title: string;
  usdrValue: string;
};

type PaybackModalProps = {
  data: PairType;
};

const PaybackModal = ({ data }: any) => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();
  const usdrMint = useMint(data.usdrMint);

  const repay = () => {
    if (usdrMint) {
      repayUSDr(connection, wallet, 10 * Math.pow(10, usdrMint.decimals), new PublicKey(data.mint))
        .then(() => {})
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setShow(false);
        });
    }
  };

  return (
    <div className="dashboardModal">
      <Button className="button--fill fillBtn" onClick={() => setShow(!show)}>
        Pay Back
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
            <h4>Pay back USDr debt</h4>
            <h5>
              You owe <span className="dashboardModal__modal__header-red">$7.45 USDr</span>. Pay back some or all of
              your debt below.
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">How much would you like to pay back?</label>
            <CustomInput appendStr="Max" tokenStr="USDr" />
            <label className="dashboardModal__modal__label mt-3">Estimated token value</label>
            <CustomDropDownInput />
            <Button className="button--fill bottomBtn" onClick={() => repay()}>
              Pay Back Debt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PaybackModal;

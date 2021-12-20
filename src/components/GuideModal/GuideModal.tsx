import React from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import Button from '../Button';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';

const GuideModal = () => {
  const [show, setShow] = React.useState(false);
  const connection = useConnection();
  const { wallet, connected } = useWallet();

  return (
    <div className="guidemodal">
      <Button disabled={!connected} className="button--fill guidemodal__button" onClick={() => setShow(!show)}>
        Guide
      </Button>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="guidemodal"
      >
        <Modal.Body>
          <div className="guidemodal__header">
            <IoMdClose size={32} className="guidemodal__header-close" onClick={() => setShow(false)} />
            <h2 className="guidemodal__title">Guide</h2>
            <div className="guidemodal__body">
              <p>Step 1: Switch your wallet from a mainnet wallet to devnet </p>
              <p>Step 2: Go to solfaucet.com to obtain devnet sol </p>
              <p>Step 3: Connect your wallet to dev.ratio.finance</p>
              <p>Step 4: Go to the faucet on the site </p>
              <p>Step 5: Mint any of the LP devnet tokens </p>
              <p>Step 6: Use the app to deposit, mint, pay back, and withdraw LP </p>
              <h6>Note: Phantom wallets will give the best user experience</h6>
            </div>
            <div className="guidemodal__btnBox row">
              <div className="col">
                <Button className="gradientBtn" onClick={() => setShow(!show)}>
                  Exit
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GuideModal;

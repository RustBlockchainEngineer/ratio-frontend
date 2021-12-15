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
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="disclaimerModal"
      >
        <Modal.Body>
          <div className="disclaimerModal__header">
            <IoMdClose size={32} className="disclaimerModal__header-close" onClick={() => setShow(false)} />
            <h2 className="disclaimerModal__title">Guide</h2>
            <div className="disclaimerModal__body">
              Are you sure you’d like to proceed? This LP pair has been
              <strong> extremely volatile over the last 30 days</strong> and has displayed considerable risk.
            </div>
            <div className="disclaimerModal__btnBox row">
              <div className="col">
                <Button className="gradientBtn" onClick={() => setShow(!show)}>
                  Cancel
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

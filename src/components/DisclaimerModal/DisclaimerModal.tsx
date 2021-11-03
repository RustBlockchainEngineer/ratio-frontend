import React from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import LockVaultModal from '../LockVaultModal';
import Button from '../Button';

type PairType = {
  id: number;
  icons: Array<string>;
  title: string;
  tvl: string;
  risk: number;
  apr: number;
  details: string;
};

type LockVaultModalProps = {
  data: PairType;
};

const DisclaimerModal = ({ data }: LockVaultModalProps) => {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <Button className="button--fill generate" onClick={() => setShow(!show)}>
        Mint USDr
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
            <h2 className="disclaimerModal__title">Disclaimer</h2>
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
              <div className="col">
                <LockVaultModal data={data} />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DisclaimerModal;

import React from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import Button from '../../Button';
import CustomInput from '../../CustomInput';

type PairType = {
  icons: Array<string>;
  usdrValue: string;
};

type GenerateModalProps = {
  data: PairType;
};

const GenerateModal = ({ data }: GenerateModalProps) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="dashboardModal">
      <Button className="gradientBtn" onClick={() => setShow(!show)}>
        Withdraw
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
            <IoMdClose
              size={32}
              className="dashboardModal__modal__header-close"
              onClick={() => setShow(false)}
            />
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
            <label className="dashboardModal__modal__label">
              How much would you like to generate?
            </label>
            <CustomInput
              appendStr="Max"
              appendValueStr="(32.34)"
              tokenStr="USDr"
            />
            <p className="dashboardModal__modal__body-red">
              There will be a 2% stability fee associated with this transaction.
            </p>
            <Button
              className="button--fill bottomBtn"
              onClick={() => setShow(false)}
            >
              Pay USDr Debt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GenerateModal;

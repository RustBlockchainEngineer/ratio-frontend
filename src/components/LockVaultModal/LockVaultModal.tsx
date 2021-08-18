import React from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import { useHistory } from 'react-router-dom';
import Button from '../Button';
import CustomInput from '../CustomInput';

import riskLevel from '../../assets/images/risklevel.svg';
import highRisk from '../../assets/images/highrisk.svg';

type PairType = {
  id: number;
  icons: Array<string>;
  title: string;
  tvl: string;
  risk: string;
  apr: number;
  details: string;
};

type LockVaultModalProps = {
  data: PairType;
};

const LockVaultModal = ({ data }: LockVaultModalProps) => {
  const history = useHistory();
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
        className="lockvaultmodal"
      >
        <Modal.Header>
          <div className="lockvaultmodal__header">
            <IoMdClose
              size={32}
              className="lockvaultmodal__header-close"
              onClick={() => setShow(false)}
            />
            <div>
              <img src={data.icons[0]} alt={data.icons[0].toString()} />
              <img
                src={data.icons[1]}
                alt={data.icons[1].toString()}
                className="lockvaultmodal__header-icon"
              />
            </div>
            <h3>Lock {data.title}-LP into vault</h3>
            <label className="lockvaultmodal__label1">
              How much would you like to lock up?
            </label>
            <label className="lockvaultmodal__label2">
              Min: <strong>1 USDr</strong>, Max: <strong>1000 USDr</strong>
            </label>
            <CustomInput
              appendStr="Max"
              appendValueStr="(1000)"
              tokenStr={`${data.title}-LP`}
            />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="lockvaultmodal__body">
            <div className="d-flex justify-content-between">
              <div className="lockvaultmodal__body-label">APR:</div>
              <div className="lockvaultmodal__body-value">125%</div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div className="lockvaultmodal__body-label">
                Risk level:
                <img src={riskLevel} alt="risklevel" />
              </div>
              <div className="lockvaultmodal__body-red">
                <img src={highRisk} alt="highrisk" className="mr-1" />
                92%
              </div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div className="lockvaultmodal__body-label">Vault Value:</div>
              <div className="lockvaultmodal__body-value opacity-5">?</div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div className="lockvaultmodal__body-label">
                Baseline Overcollateralization:
              </div>
              <div className="lockvaultmodal__body-value opacity-5">?</div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div className="lockvaultmodal__body-label">
                Liquidation Ratio:
              </div>
              <div className="lockvaultmodal__body-value opacity-5">?</div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="lockvaultmodal__footer">
            <label className="lockvaultmodal__label1">
              How much USDr would you like to generate?
            </label>
            <label className="lockvaultmodal__label2">
              Min: <strong>1 USDr</strong>, Max: <strong>1000 USDr</strong>
            </label>
            <CustomInput
              appendStr="Max"
              appendValueStr="(1000)"
              tokenStr={`${data.title}-LP`}
            />
            <Button
              className="button--fill lockBtn"
              onClick={() => history.push('/vaultdashboard')}
            >
              Lock Assets & Mint
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LockVaultModal;

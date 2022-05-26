import React, { useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { ThemeContext } from '../../contexts/ThemeContext';
import Button from '../../components/Button';
// import { IoMdClose } from 'react-icons/io';
import logo from '../../assets/images/logo-side.svg';
import termsPDF from '../../assets/terms.pdf';
const TermsAndConditionModal = ({ show, setShow }) => {
  const theme = useContext(ThemeContext);
  const { darkMode } = theme.state;

  const [checked, setChecked] = useState(false);

  return (
    <div>
      <Modal
        show={show}
        onHide={() => {
          setShow(true);
        }}
        size="xl"
        centered
        className="termsmodal__modal"
        data-theme={darkMode ? 'dark' : 'light'}
      >
        <Modal.Body>
          <div className="row no-gutters termsmodal">
            <div className="col-md-4 col-sm-12 termsmodal__left">
              <img src={logo} alt="logo" />
              <a target="_blank" href={termsPDF} rel="noreferrer">
                Terms & Conditions
              </a>
            </div>
            <div className="col-md-8 col-sm-12 termsmodal__right">
              <h3>Terms of Service</h3>
              <h4>Accepting the terms</h4>
              <div className="termsmodal__right__contents">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
                quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
                aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
                sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
                aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse
                quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
              </div>
              <div className="termsmodal__right__agreebox">
                <label className="checkcontainer">
                  Agree to the Terms of Service
                  <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} />
                  <span className="checkmark"></span>
                </label>
                <Button disabled={!checked} className="button--blue agreeBtn" onClick={setShow}>
                  Agree
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TermsAndConditionModal;

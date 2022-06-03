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
      <Modal show={show} size="xl" centered className="termsmodal__modal" data-theme={darkMode ? 'dark' : 'light'}>
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
                Welcome to Ratio Finance. By using our platform, you confirm that you are not a citizen or resident of
                the Belarus, Cuba, Iran, Iraq, Côte d’Ivoire, Liberia, North Korea, Sudan, Syria, United Kingdom, United
                States or Zimbabwe and aren’t currently accessing and will not in the future utilize this redirect while
                located within these jurisdictions, including by using VPNs or other techniques to mask your physical
                location. By using this platform you also accept the{' '}
                <a target="_blank" href={termsPDF} rel="noreferrer">
                  Terms and Conditions
                </a>{' '}
                of this site.
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

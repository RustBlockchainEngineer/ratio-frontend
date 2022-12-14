import React from 'react';
import imageLogo from '../../assets/images/image-logo.svg';
import telegram from '../../assets/images/telegram.svg';
import twitter from '../../assets/images/twitter.svg';
import medium from '../../assets/images/medium.svg';
import telegramDark from '../../assets/images/telegram-dark.svg';
import twitterDark from '../../assets/images/twitter-dark.svg';
import mediumDark from '../../assets/images/medium-dark.svg';
import whitepaperPDF from '../../assets/whitepaper.pdf';
import privacypolicyPDF from '../../assets/privacy-policy.pdf';
import termsPDF from '../../assets/terms.pdf';
import ackee_logo from '../../assets/images/ackee_logo.svg';
import kudelski_logo from '../../assets/images/kudelski_logo.png';

type FooterProps = {
  darkMode: boolean;
};

const Footer = ({ darkMode }: FooterProps) => {
  return (
    <div className="footer">
      <div className="d-flex justify-content-between">
        <div>
          <img src={imageLogo} alt="imageLogo" />
          <h6 className="mt-4 mb-2">Audited by:</h6>
          <div className="d-flex">
            <img src={kudelski_logo} alt="kudelski_logo" style={{ width: 90 }} />
            <img src={ackee_logo} alt="ackee_logo" style={{ width: 150, marginLeft: 15 }} />
          </div>
        </div>
        <div className="d-flex footer__social">
          <a target="_blank" href="https://t.me/ratiofinance" rel="noreferrer">
            <img src={darkMode ? telegramDark : telegram} alt="telegram" />
          </a>
          <a target="_blank" href="https://twitter.com/ratiofinance" rel="noreferrer">
            <img src={darkMode ? twitterDark : twitter} alt="twitter" />
          </a>
          <a target="_blank" href="https://medium.com/@ratiofinance" rel="noreferrer">
            <img src={darkMode ? mediumDark : medium} alt="medium" />
          </a>
        </div>
      </div>
      <div className="mt-5 d-md-flex justify-content-between">
        <h6>
          Copyright © 2021. Ratio Protocol.
          <br /> All rights reserved.
        </h6>
        <ul className="list-group list-group-horizontal">
          <li className="list-group-item">
            <a target="_blank" href={whitepaperPDF} rel="noreferrer">
              Whitepaper
            </a>
          </li>
          <li className="list-group-item">
            <a target="_blank" href={termsPDF} rel="noreferrer">
              Terms & Conditions
            </a>
          </li>
          <li className="list-group-item">
            <a target="_blank" href={privacypolicyPDF} rel="noreferrer">
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;

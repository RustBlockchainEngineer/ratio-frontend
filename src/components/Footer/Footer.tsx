import React from 'react';
import imageLogo from '../../assets/images/image-logo.svg';
import telegram from '../../assets/images/telegram.svg';
import twitter from '../../assets/images/twitter.svg';
import medium from '../../assets/images/medium.svg';
import telegramDark from '../../assets/images/telegram-dark.svg';
import twitterDark from '../../assets/images/twitter-dark.svg';
import mediumDark from '../../assets/images/medium-dark.svg';
import whitepaperPDF from '../../assets/whitepaper.pdf';

type FooterProps = {
  darkMode: boolean;
};

const Footer = ({ darkMode }: FooterProps) => {
  return (
    <div className="footer">
      <div className="d-flex justify-content-between">
        <img src={imageLogo} alt="imageLogo" />
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
      <div className="mt-4 d-md-flex justify-content-between">
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
            <a
              target="_blank"
              href="https://www.termsandconditionsgenerator.com/live.php?token=rsyWvkb1kWABkMw0tccnyaYF1VErQeOk"
              rel="noreferrer"
            >
              Terms & Conditions
            </a>
          </li>
          <li className="list-group-item">
            <a
              target="_blank"
              href="https://www.privacypolicygenerator.info/live.php?token=BdvNralxCwYJOo06TYdHMniHdNH4icGj"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;

import React from 'react';
import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import Button from '../Button';
import { useWallet } from '../../contexts/wallet';

const GuideModal = () => {
  const [show, setShow] = React.useState(false);
  const { connected } = useWallet();

  const onClickGuideBtn = () => {
    window.open('https://docs.ratio.finance');
  };

  return (
    <div className="guidemodal">
      <Button disabled={!connected} className="button--blue guidemodal__button" onClick={onClickGuideBtn}>
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
            <h6>
              We are thrilled to release the Devnet version 2.0 of the Ratio platform. We hope this preview into our
              project is as exciting to you as it is to us. The Devnet project provides a chance to view our user
              interface and get a sense of the user experience we provide.
            </h6>

            <h6>
              Try out our functionality by providing Saber liquidity to our LP vaults and minting USDr in exchange. You
              have access to vaults for 4 LP tokens: USDC-USDT, USDC-PAI, USDC-CASH, and USDT-CASH. The LP tokens are
              each valued at $1 for this release. The faucet will mint $10 worth of tokens in a single transaction. When
              you deposit these tokens into an available vault, this vault is then considered active and you may mint an
              amount of USDr corresponding to the collateralization ratio.
            </h6>

            <h6>
              A sophisticated risk analysis algorithm is a premier feature offered to users on the Ratio platform. As
              such, in our Devnet version we assign a Ratio Risk Rating to each of the Saber LP tokens.
            </h6>

            <h6>
              On depositing LP into a Ratio vault, the tokens will be immediately sent to the corresponding Saber yield
              farm and will begin earning rewards, which can be harvested at any time.
            </h6>

            <div className="guidemodal__body">
              <p>Step 1: Switch your wallet from a mainnet wallet to devnet </p>
              <p>Step 2: Go to solfaucet.com to obtain devnet sol </p>
              <p>Step 3: Connect your wallet to dev.ratio.finance</p>
              <p>Step 4: Go to the faucet on the site </p>
              <p>Step 5: Mint any of the LP devnet tokens </p>
              <p>Step 6: Use the app to deposit, mint, pay back, withdraw, and harvest. </p>
              {/* <h6 className="mt-3">
                Note: Note: Phantom wallets will give the best user experience as token names and icons will be imported
                to wallet.
              </h6> */}
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

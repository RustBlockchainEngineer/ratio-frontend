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
            <h6>
              We are thrilled to release the Devnet version of the Ratio platform. We hope this preview into our project
              is as exciting to you as it is to us. The Devnet project provides a chance to view our user interface and
              get a sense of the user experience we provide.
            </h6>

            <h6>
              Try out our functionality by providing liquidity to our LP vaults and minting USDr in exchange. You have
              access to vaults for 4 LP tokens: USDC-USDR, ETH-SOL, ATLAS-RAY, and SAMO-RAY. For Devnet testing, users
              can lock $10 worth of any of the tokens (0.1 tokens) in a single deposit and then mint a maximum amount of
              USDr corresponding to the risk factor.
            </h6>

            <h6>
              A sophisticated risk analysis algorithm is a premier feature offered to users on the Ratio platform. As
              such, in our Devnet version we assign a static risk value to each of our 4 LP tokens prior to releasing
              our integrated risk analysis functionality on Mainnet.
            </h6>

            <h6>
              In order for a user to withdraw their collateral, their full debt must be paid back, which can be done as
              a single transaction. The user can then withdraw the total amount of collateral locked in their vault,
              also in a single transaction.
            </h6>
            <div className="guidemodal__body">
              <p>Step 1: Switch your wallet from a mainnet wallet to devnet </p>
              <p>Step 2: Go to solfaucet.com to obtain devnet sol </p>
              <p>Step 3: Connect your wallet to dev.ratio.finance</p>
              <p>Step 4: Go to the faucet on the site </p>
              <p>Step 5: Mint any of the LP devnet tokens </p>
              <p>Step 6: Use the app to deposit, mint, pay back, and withdraw LP </p>
              <h6 className="mt-3">
                Note: Note: Phantom wallets will give the best user experience as token names and icons will be imported
                to wallet.
              </h6>
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

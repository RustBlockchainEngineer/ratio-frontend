import React from 'react';
import DepositModal from '../DepositModal';
import PaybackModal from '../PaybackModal';
import WithdrawModal from '../WithdrawModal';
import GenerateModal from '../GenerateModal';
import Button from '../../Button';

import { MINTADDRESS } from '../../../constants';

import usdrIcon from '../../../assets/images/USDr.png';
import rayIcon from '../../../assets/images/RAY.svg';
import solIcon from '../../../assets/images/SOL.svg';
import { getFaucetState } from '../../../utils/ratio-faucet';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { getUsdrMintKey } from '../../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';

interface ModalcardInterface {
  title: string;
  mint: string;
  tokens: Array<string>;
  tokenNames: string;
  tokenValue: string;
  type: string;
  withdrawValue?: string;
  GenerateValue?: string;
}

const ModalCard = ({
  mintAddress,
  title,
  icons,
  tokenName,
  type,

  depositValue,
  withdrawValue,
  generateValue,
  debtValue,

  riskLevel,
}: any) => {
  const depositData = {
    mint: mintAddress,
    icons: [rayIcon, solIcon],
    title: tokenName,
    value: depositValue,
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };

  const withdrawData = {
    mint: mintAddress,
    icons: [rayIcon, solIcon],
    title: tokenName,
    value: withdrawValue,
    usdrValue: debtValue,
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };
  const paybackData = {
    mint: mintAddress,
    icons: [usdrIcon],
    title: tokenName,
    usdrValue: debtValue,
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };

  const generateData = {
    mint: mintAddress,
    icons: [usdrIcon],
    title: tokenName,
    usdrValue: generateValue,
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };
  return (
    <div className="modalCard">
      <p className="modalCard__title mb-2">{title}</p>
      <div className="modalCard__cardbody">
        <div className="modalCard__header">
          <div className="d-flex align-items-start">
            <div>
              {icons && <img src={icons[0]} alt={icons[0].toString()} />}
              {icons && icons[1] && <img src={icons[1]} alt={icons[1].toString()} className="modalCard__header-icon" />}
            </div>
            <div className="modalCard__header_tokenName">
              {/* <p>{data.tokenNames}</p> */}
              {/* <h6>{data.tokenValue}</h6> */}
              {type === 'borrow_payback' && <p>${Math.ceil(paybackData.usdrValue * 100) / 100} USDr</p>}
            </div>
          </div>
          <div>
            {type === 'deposit_withdraw' && (
              <div>
                <DepositModal data={depositData} />
              </div>
            )}
            {type === 'borrow_payback' && <PaybackModal data={paybackData} />}
          </div>
        </div>
        <div className="modalCard__footer">
          <div>
            {type === 'borrow_payback' && (
              <div>
                <label>Able to generate</label>
                <p>{generateValue.toFixed(2)} USDr</p>
              </div>
            )}
            {type === 'deposit_withdraw' && (
              <div>
                <p>{tokenName}</p>
                <h6>{withdrawValue.toFixed(2)}</h6>
              </div>
            )}
          </div>
          <div>
            {type === 'deposit_withdraw' && <WithdrawModal data={withdrawData} />}
            {type === 'borrow_payback' && (
              <div>
                <GenerateModal data={generateData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCard;

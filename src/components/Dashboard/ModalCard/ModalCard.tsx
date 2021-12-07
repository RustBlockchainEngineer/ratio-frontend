import React from 'react';
import DepositModal from '../DepositModal';
import PaybackModal from '../PaybackModal';
import WithdrawModal from '../WithdrawModal';
import GenerateModal from '../GenerateModal';

import { MINTADDRESS } from '../../../constants';

import usdrIcon from '../../../assets/images/USDr.png';
import rayIcon from '../../../assets/images/RAY.svg';
import solIcon from '../../../assets/images/SOL.svg';
import { getFaucetState } from '../../../utils/ratio-faucet';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { getUsdrMintKey } from '../../../utils/ratio-lending';

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

type ModalCardProps = {
  data: ModalcardInterface;
};

const ModalCard = ({ mintAddress, title, icons, tokenName, tokenValue, type, generateValue, riskLevel }: any) => {
  const depositData = {
    mint: mintAddress,
    icons: icons,
    title: title,
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };
  const paybackData = {
    mint: mintAddress,
    icons: [usdrIcon],
    title: title,
    usdrValue: '$7.45',
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };
  const withdrawData = {
    mint: mintAddress,
    icons: icons,
    title: title,
    value: '12.54',
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };

  const generateData = {
    mint: mintAddress,
    icons: [usdrIcon],
    title: title,
    usdrValue: '32.34',
    usdrMint: MINTADDRESS['USDR'],
    riskLevel: riskLevel,
  };

  return (
    <div className="modalCard">
      <p className="modalCard__title mb-2">{title}</p>
      <div className="modalCard__cardbody">
        <div className="modalCard__header">
          <div className="d-flex align-items-center">
            <div>
              {icons && <img src={icons[0]} alt={icons[0].toString()} />}
              {icons && icons[1] && <img src={icons[1]} alt={icons[1].toString()} className="modalCard__header-icon" />}
            </div>
            <div className="modalCard__header_tokenName">
              {/* <p>{data.tokenNames}</p> */}
              {/* <h6>{data.tokenValue}</h6> */}
            </div>
          </div>
          <div>
            {type === 'deposit' && <DepositModal data={depositData} />}
            {type === 'payback' && <PaybackModal data={paybackData} />}
          </div>
        </div>
        <div className="modalCard__footer">
          <div>
            {type === 'payback' && (
              <div>
                <label>Able to generate</label>
                <p>{tokenValue} USDr</p>
              </div>
            )}
            {type === 'deposit' && (
              <div>
                <p>{tokenName}</p>
                <h6>{tokenValue}</h6>
              </div>
            )}
          </div>
          <div>
            {type === 'deposit' && <WithdrawModal data={withdrawData} />}
            {type === 'payback' && <GenerateModal data={generateData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCard;

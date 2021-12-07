import React from 'react';
import DepositModal from '../DepositModal';
import PaybackModal from '../PaybackModal';
import WithdrawModal from '../WithdrawModal';
import GenerateModal from '../GenerateModal';

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

const ModalCard = ({ data }: any) => {
  const depositData = {
    mint: data.mint,
    icons: [rayIcon, solIcon],
    title: 'USDC-USDr',
    usdrMint: data.usdrMint,
    riskLevel: data.riskLevel,
  };
  const paybackData = {
    mint: data.mint,
    icons: [usdrIcon],
    title: 'USDC-USDr',
    usdrValue: '$7.45',
    usdrMint: data.usdrMint,
    riskLevel: data.riskLevel,
  };
  const withdrawData = {
    mint: data.mint,
    icons: [rayIcon, solIcon],
    title: 'USDC-USDr',
    value: '12.54',
    usdrMint: data.usdrMint,
    riskLevel: data.riskLevel,
  };

  const generateData = {
    mint: data.mint,
    icons: [usdrIcon],
    title: 'USDC-USDr',
    usdrValue: '32.34',
    usdrMint: data.usdrMint,
    riskLevel: data.riskLevel,
  };

  return (
    <div className="modalCard">
      <p className="modalCard__title mb-2">{data.title}</p>
      <div className="modalCard__cardbody">
        <div className="modalCard__header">
          <div className="d-flex align-items-center">
            <div>
              <img src={data.tokens[0]} alt={data.tokens[0].toString()} />
              {data.tokens[1] && (
                <img src={data.tokens[1]} alt={data.tokens[1].toString()} className="modalCard__header-icon" />
              )}
            </div>
            <div className="modalCard__header_tokenName">
              {/* <p>{data.tokenNames}</p> */}
              {/* <h6>{data.tokenValue}</h6> */}
            </div>
          </div>
          <div>
            {data.type === 'deposit' && <DepositModal data={depositData} />}
            {data.type === 'payback' && <PaybackModal data={paybackData} />}
          </div>
        </div>
        <div className="modalCard__footer">
          <div>
            {data.type === 'payback' && <label>Able to generate</label>}
            {data.type === 'deposit' ? (
              <div>
                <p>{data.tokenNames}</p>
                <h6>{data.tokenValue}</h6>
              </div>
            ) : (
              <p>{data.GenerateValue}</p>
            )}
          </div>
          <div>
            {data.type === 'deposit' && <WithdrawModal data={withdrawData} />}
            {data.type === 'payback' && <GenerateModal data={generateData} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCard;

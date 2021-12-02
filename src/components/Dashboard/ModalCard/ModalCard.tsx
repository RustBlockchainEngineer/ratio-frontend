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

const depositData = {
  mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
  icons: [rayIcon, solIcon],
  title: 'USDC-USDr',
  usdrMint: '',
};
const paybackData = {
  mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
  icons: [usdrIcon],
  title: 'USDC-USDr',
  usdrValue: '$7.45',
  usdrMint: '',
};
const withdrawData = {
  mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
  icons: [rayIcon, solIcon],
  title: 'USDC-USDr',
  value: '12.54',
  usdrMint: '',
};

const generateData = {
  mint: '6La9ryWrDPByZViuQCizmo6aW98cK8DSL7angqmTFf9i',
  icons: [usdrIcon],
  usdrValue: '32.34',
  usdrMint: '',
};

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

const ModalCard = ({ data }: ModalCardProps) => {
  const connection = useConnection();
  const wallet = useWallet().wallet;
  getFaucetState(connection, wallet).then((result) => {
    depositData.mint = result.mintUsdcUsdrLp.toBase58();
    paybackData.mint = result.mintUsdcUsdrLp.toBase58();
    withdrawData.mint = result.mintUsdcUsdrLp.toBase58();
    generateData.mint = result.mintUsdcUsdrLp.toBase58();
  });
  getUsdrMintKey(connection, wallet).then((result) => {
    depositData.usdrMint = result;
    paybackData.usdrMint = result;
    withdrawData.usdrMint = result;
    generateData.usdrMint = result;
  });
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
              <p>{data.tokenNames}</p>
              <h6>{data.tokenValue}</h6>
            </div>
          </div>
          <div>
            {data.type === 'deposit' && <DepositModal data={depositData} />}
            {data.type === 'payback' && <PaybackModal data={paybackData} />}
          </div>
        </div>
        <div className="modalCard__footer">
          <div>
            {data.type === 'deposit' ? <label>Able to Mint</label> : <label>Able to generate</label>}
            {data.type === 'deposit' ? <p>{data.withdrawValue}</p> : <p>{data.GenerateValue}</p>}
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

import React from 'react';
import DepositModal from '../DepositModal';
import PaybackModal from '../PaybackModal';
import WithdrawModal from '../WithdrawModal';
import GenerateModal from '../GenerateModal';
import usdrIcon from '../../../assets/images/USDr.png';
import { USDR_MINT_KEY } from '../../../utils/ratio-lending';

const ModalCard = ({
  mintAddress,
  title,
  icon,
  icons,
  tokenName,
  type,
  depositValue,
  withdrawValue,
  generateValue,
  debtValue,
  usdrWalletValue,
  riskLevel,
  price,
}: any) => {
  const depositData = {
    mint: mintAddress,
    icon: icon,
    icons: icons,
    title: tokenName,
    value: depositValue,
    usdrMint: USDR_MINT_KEY,
    riskLevel: riskLevel,
    tokenPrice: price,
  };

  const withdrawData = {
    mint: mintAddress,
    icon: icon,
    icons: icons,
    title: tokenName,
    value: withdrawValue,
    debtValue: debtValue,
    usdrMint: USDR_MINT_KEY,
    riskLevel: riskLevel,
    tokenPrice: price,
  };
  const paybackData = {
    mint: mintAddress,
    icons: [usdrIcon],
    title: tokenName,
    usdrValue: usdrWalletValue,
    debtValue: debtValue,
    usdrMint: USDR_MINT_KEY,
    riskLevel: riskLevel,
  };

  const generateData = {
    mint: mintAddress,
    icons: [usdrIcon],
    title: tokenName,
    usdrValue: generateValue,
    usdrMint: USDR_MINT_KEY,
    riskLevel: riskLevel,
  };

  return (
    <div className="modalCard">
      <p className="modalCard__title mb-2">{title}</p>
      <div className="modalCard__cardbody">
        <div className="modalCard__header">
          <div className="d-flex align-items-start">
            <div>
              {icon && <img src={icon} alt={'Token1'} />}
              {/* {type === 'deposit_withdraw' && icons && <img src={icons[0]} alt={icons[0].toString()} />} */}
              {/* {icons && icons[1] && <img src={icons[1]} alt={icons[1].toString()} className="modalCard__header-icon" />} */}
            </div>
            <div className="modalCard__header_tokenName">
              {/* <p>{data.tokenNames}</p> */}
              {/* <h6>{data.tokenValue}</h6> */}
              {type === 'borrow_payback' && (
                <div>
                  <label>Able to mint</label>
                  <p className="mt-0">{generateValue} USDr</p>
                </div>
              )}
            </div>
          </div>
          <div>
            {type === 'deposit_withdraw' && (
              <div>
                <DepositModal data={depositData} />
              </div>
            )}
            {type === 'borrow_payback' && <GenerateModal data={generateData} />}
          </div>
        </div>
        <div className="modalCard__footer">
          <div>
            {/* {type === 'borrow_payback' && (
              <div>
                <label>Able to mint</label>
                <p>{generateValue.toFixed(2)} USDr</p>
              </div>
            )} */}
            {type === 'borrow_payback' && (
              <div className="d-flex align-items-center">
                {icons && <img src={icons[0]} alt={icons[0].toString()} />}
                <p className="ml-2">{paybackData.debtValue} USDr</p>
              </div>
            )}
            {type === 'deposit_withdraw' && (
              <div>
                <p>{tokenName === 'USDC-USDR' ? 'USDC-USDr' : tokenName}</p>
                <h6>{withdrawValue}</h6>
              </div>
            )}
          </div>
          <div>
            {type === 'deposit_withdraw' && <WithdrawModal data={withdrawData} />}
            {type === 'borrow_payback' && (
              <div>
                <PaybackModal data={paybackData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCard;

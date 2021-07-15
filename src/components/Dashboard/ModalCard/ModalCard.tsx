import React from 'react'
import DepositModal from '../DepositModal'
import PaybackModal from '../PaybackModal'
import WithdrawModal from '../WithdrawModal'
import GenerateModal from '../GenerateModal'

import usdrIcon from '../../../assets/images/USDr.svg'
import rayIcon from '../../../assets/images/RAY.svg'
import solIcon from '../../../assets/images/SOL.svg'

const depositData = { icons: [rayIcon, solIcon], title: 'RAY-SOL' }
const paybackData = {
  icons: [usdrIcon],
  title: 'RAY-SOL',
  usdrValue: '$7.45',
}
const withdrawData = {
  icons: [rayIcon, solIcon],
  title: 'RAY-SOL',
  value: '12.54',
}

const generateData = {
  icons: [usdrIcon],
  usdrValue: '32.34',
}

interface ModalcardInterface {
  title: string
  tokens: Array<string>
  tokenNames: string
  tokenValue: string
  type: string
  withdrawValue?: string
  GenerateValue?: string
}

type ModalCardProps = {
  data: ModalcardInterface
}

const ModalCard = ({ data }: ModalCardProps) => {
  return (
    <div className="modalCard">
      <p className="modalCard__title mb-2">{data.title}</p>
      <div className="modalCard__cardbody">
        <div className="modalCard__header">
          <div className="d-flex align-items-center">
            <div>
              <img src={data.tokens[0]} alt={data.tokens[0].toString()} />
              {data.tokens[1] && (
                <img
                  src={data.tokens[1]}
                  alt={data.tokens[1].toString()}
                  className="modalCard__header-icon"
                />
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
            {data.type === 'deposit' ? (
              <label>Able to withdraw</label>
            ) : (
              <label>Able to generate</label>
            )}
            {data.type === 'deposit' ? (
              <p>{data.withdrawValue}</p>
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
  )
}

export default ModalCard

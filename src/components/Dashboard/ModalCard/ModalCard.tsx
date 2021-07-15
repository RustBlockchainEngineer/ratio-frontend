import React from 'react'

import Button from '../../Button'

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
            {data.type === 'deposit' && (
              <Button className="button--fill modalCard__fillBtn">
                Deposit
              </Button>
            )}
            {data.type === 'payback' && (
              <Button className="button--fill modalCard__fillBtn">
                Pay Back
              </Button>
            )}
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
            {data.type === 'deposit' && (
              <Button className="modalCard__gradientBtn">Withdraw</Button>
            )}
            {data.type === 'payback' && (
              <Button className="modalCard__gradientBtn">Generate</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalCard

import React from 'react'
import { Modal } from 'react-bootstrap'
import { IoMdClose } from 'react-icons/io'
import Button from '../../Button'
import CustomInput from '../../CustomInput'
import CustomDropDownInput from '../../CustomDropDownInput'

type PairType = {
  icons: Array<string>
  title: string
  usdrValue: string
}

type PaybackModalProps = {
  data: PairType
}

const PaybackModal = ({ data }: PaybackModalProps) => {
  const [show, setShow] = React.useState(false)
  return (
    <div className="dashboardModal">
      <Button className="button--fill fillBtn" onClick={() => setShow(!show)}>
        Pay Back
      </Button>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="dashboardModal__modal"
      >
        <Modal.Header>
          <div className="dashboardModal__modal__header">
            <IoMdClose
              size={32}
              className="dashboardModal__modal__header-close"
              onClick={() => setShow(false)}
            />
            <div>
              <img src={data.icons[0]} alt={data.icons[0].toString()} />
            </div>
            <h4>Pay back USDr debt</h4>
            <h5>
              You owe{' '}
              <span className="dashboardModal__modal__header-red">
                $7.45 USDr
              </span>
              . Pay back some or all of your debt below.
            </h5>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="dashboardModal__modal__body">
            <label className="dashboardModal__modal__label">
              How much would you like to pay back?
            </label>
            <CustomInput appendStr="Max" tokenStr="USDr" />
            <label className="dashboardModal__modal__label mt-3">
              Estimated token value
            </label>
            <CustomDropDownInput />
            <Button
              className="button--fill bottomBtn"
              onClick={() => setShow(false)}
            >
              Pay Back Debt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default PaybackModal

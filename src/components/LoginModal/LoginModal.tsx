import React, { useEffect } from 'react';
import { Form, Modal } from 'react-bootstrap';
import Button from '../Button';
import { useLoggedIn } from '../../contexts/auth';

const LoginModal = () => {
  const [password, setPassword] = React.useState<string>('');
  const [show, setShow] = React.useState<boolean>(true);
  const { setLoggedIn } = useLoggedIn();

  const validatePassword = () => {
    if (password === 'ratio') {
      console.log('Password correct');
      setLoggedIn(true);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => setShow(true)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="disclaimerModal"
      >
        <Modal.Body>
          <div className="disclaimerModal__header">
            <h2 className="disclaimerModal__title">Login to admin Panel</h2>
            <div className="disclaimerModal__body">
              If you are not owner you don&apos;t need to login admin panel.
              <strong> It&apos;s like a two step verification</strong>.
              <br />
              <br />
            </div>
            <Form.Control
              type="password"
              placeholder="Input password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="disclaimerModal__btnBox row">
              <div className="col">
                <Button className="gradientBtn" onClick={() => validatePassword()}>
                  Login
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LoginModal;

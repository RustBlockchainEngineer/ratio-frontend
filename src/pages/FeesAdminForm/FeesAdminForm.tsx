import React, { useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { ThemeContext } from '../../contexts/ThemeContext';
import { actionTypes } from '../../features/wallet';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';

export default function FeesAdminForm() {
  const theme = React.useContext(ThemeContext);
  const { darkMode } = theme.state;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [collapseFlag, setCollapseFlag] = React.useState(false);
  const [model, setModel] = React.useState({
    deposit: 0,
    withdraw: 0,
    borrow: 0,
    payback: 0,
    rewards: 0,
  });

  const { accessToken } = useAuthContextProvider();

  const fetchFees = useCallback(async (userAddress: string | undefined) => {
    const response = await fetch(`${API_ENDPOINT}/auth/`, {
      body: JSON.stringify({ accessToken }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    if (!response.ok) {
      throw await response.json();
    }
    return response.json();
  }, []);

  const dispatch = useDispatch();

  const onClickWalletBtn = () => {
    dispatch({ type: actionTypes.CONNECTED_WALLET });
  };

  const clickMenuTrigger = () => {
    setMenuOpen(!menuOpen);
  };

  const onCollapseMenu = () => {
    setCollapseFlag(!collapseFlag);
  };
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    //resetLastName();
  };
  return (
    <div className="admin_form_page" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="admin_form_page_container">
        <Header onClickWalletBtn={onClickWalletBtn} darkMode={darkMode} />
        <Navbar
          darkMode={darkMode}
          onClickWalletBtn={onClickWalletBtn}
          clickMenuItem={clickMenuTrigger}
          open={menuOpen}
          collapseFlag={collapseFlag}
          setCollapseFlag={onCollapseMenu}
        />
        <div className="admin_form_page_content">
          <Form>
            <p>Configure the application fees below:</p>
            <Form.Group className="mb-3" controlId="deposit">
              <Form.Label>Deposit</Form.Label>
              <InputGroup>
                <Form.Control name="deposit" type="number" step="0.01" min="0" max="100" placeholder="Fee %" />
                <InputGroup.Text id="inputGroupAppend">%</InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="withdraw">
              <Form.Label>Withdraw</Form.Label>
              <InputGroup>
                <Form.Control name="withdraw" type="number" step="0.01" min="0" max="100" placeholder="Fee %" />
                <InputGroup.Text id="inputGroupAppend">%</InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="borrow">
              <Form.Label>Borrow</Form.Label>
              <InputGroup>
                <Form.Control name="borrow" type="number" step="0.01" min="0" max="100" placeholder="Fee %" />
                <InputGroup.Text id="inputGroupAppend">%</InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="payback">
              <Form.Label>Pay back</Form.Label>
              <InputGroup>
                <Form.Control name="payback" type="number" step="0.01" min="0" max="100" placeholder="Fee %" />
                <InputGroup.Text id="inputGroupAppend">%</InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="rewards">
              <Form.Label>Rewards</Form.Label>
              <InputGroup>
                <Form.Control name="rewards" type="number" step="0.01" min="0" max="100" placeholder="Fee %" />
                <InputGroup.Text id="inputGroupAppend">%</InputGroup.Text>
              </InputGroup>
            </Form.Group>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

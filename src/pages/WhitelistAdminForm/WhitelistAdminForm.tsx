import React, { useCallback } from 'react';
import { Button, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import Header from '../../components/Header';
import Navbar from '../../components/Navbar';
import { ThemeContext } from '../../contexts/ThemeContext';
import { actionTypes } from '../../features/wallet';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';

export default function WhitelistAdminForm() {
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

  const fetchUsers = useCallback(async (userAddress: string | undefined) => {
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

  const usersData = [
    {
      address: '9vjjDsDqye6wAuNPEaR5KGFZmt3iZbCepebQWwV9F4bp',
      name: 'Lucas Marc',
      email: 'lucas@thinkanddev.com',
      role: 'ADMIN',
    },
  ];

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
          <h5 className="mt-3">Add new user:</h5>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col} xs="auto" md="6" controlId="deposit">
                <Form.Label>Wallet address</Form.Label>
                <InputGroup>
                  <Form.Control name="deposit" type="text" placeholder="Get solana address from user's wallet" />
                </InputGroup>
              </Form.Group>
              <Form.Group as={Col} xs="auto" md="3" controlId="withdraw">
                <Form.Label>User name</Form.Label>
                <InputGroup>
                  <Form.Control name="withdraw" type="text" placeholder="Joe Foe" />
                </InputGroup>
              </Form.Group>
              <Form.Group as={Col} xs="auto" md="6" controlId="email">
                <Form.Label>User email</Form.Label>
                <InputGroup>
                  <Form.Control name="email" type="email" placeholder="name@example.com" />
                </InputGroup>
              </Form.Group>
              <Form.Group as={Col} xs="auto" md="3" controlId="payback">
                <Form.Label>User role</Form.Label>
                <InputGroup>
                  <Form.Control as="select" aria-label="Default select example">
                    <option disabled>-Select option-</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </Form.Control>
                </InputGroup>
              </Form.Group>
            </Row>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Form>
          <h5 className="mt-3">Current users:</h5>
          <Table className="mt-3" striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Wallet address</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user) => (
                <tr key={user.address}>
                  <td>{user.address}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

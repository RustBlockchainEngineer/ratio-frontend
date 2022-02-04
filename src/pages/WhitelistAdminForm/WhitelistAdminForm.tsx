import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { API_ENDPOINT, Roles } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import AdminFormLayout from '../AdminFormLayout';

export default function WhitelistAdminForm() {
  const [version, setVersion] = React.useState(0);
  const [validated, setValidated] = useState(false);
  const defaultValues = {
    wallet_address_id: '',
    name: '',
    role: '',
  };
  const [values, setValues] = useState(defaultValues);
  const resetValues = () => {
    setValues(defaultValues);
    setValidated(false);
  };

  const handleChange = (event: any) => {
    setValues((values) => ({
      ...values,
      [event.target.name]: event.target.value,
    }));
  };

  const { accessToken } = useAuthContextProvider();

  const fetchUsers = useCallback(async () => {
    if (accessToken) {
      const response = await fetch(`${API_ENDPOINT}/users`, {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken,
        },
        method: 'GET',
      });
      if (!response.ok) {
        throw await response.json();
      }
      return response.json();
    }
  }, [accessToken]);

  const [usersData, setUsersData] = useState();

  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };

    async function load() {
      setUsersData(undefined);
      const res = await fetchUsers();
      if (!active) {
        return;
      }
      setUsersData(res);
    }
  }, [fetchUsers, version]);

  const handleSubmit = async (evt: any) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    setValidated(true);
    const response = await fetch(`${API_ENDPOINT}/users`, {
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': accessToken,
      },
      method: 'POST',
    });
    if (!response.ok) {
      throw await response.json();
    }
    resetValues();
    setVersion(version + 1);
    return response.json();
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Add new user:</h5>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} xs="auto" md="6" controlId="wallet_address_id">
            <Form.Label>Wallet address</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                name="wallet_address_id"
                type="text"
                required
                placeholder="Get solana address from user's wallet"
                value={values.wallet_address_id}
                onChange={handleChange}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} xs="auto" md="3" controlId="name">
            <Form.Label>User name</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                name="name"
                type="text"
                required
                placeholder="Joe Foe"
                value={values.name}
                onChange={handleChange}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} xs="auto" md="3" controlId="role">
            <Form.Label>User role</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                name="role"
                as="select"
                required
                aria-label="Select role"
                value={values.role}
                onChange={handleChange}
              >
                <option disabled>-Select option-</option>
                <option value={Roles.ADMIN}>Admin</option>
                <option value={Roles.USER}>User</option>
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
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {(usersData as any)?.map((user: any) => (
            <tr key={user.wallet_address_id}>
              <td>{user.wallet_address_id}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminFormLayout>
  );
}

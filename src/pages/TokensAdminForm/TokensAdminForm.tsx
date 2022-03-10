import React, { useCallback, useEffect, useState } from 'react';
import { Button, Dropdown, Form, Row, Table } from 'react-bootstrap';
import { IoMenuOutline, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import AdminFormLayout from '../AdminFormLayout';

interface Token {
  address_id: string;
  symbol: string;
  icon: string;
}
export default function TokensAdminForm() {
  const [version, setVersion] = React.useState(0);
  const [validated, setValidated] = useState(false);
  const defaultValues: Token = {
    address_id: '',
    symbol: '',
    icon: '',
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

  const fetchData = useCallback(async () => {
    if (accessToken) {
      const response = await fetch(`${API_ENDPOINT}/tokens`, {
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
  }, [accessToken, version]);

  const [data, setData] = useState<Token[]>([]);

  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };

    async function load() {
      setData([]);
      const res = await fetchData();
      if (!active) {
        return;
      }
      setData(res);
    }
  }, [fetchData, version]);

  const handleSubmit = async (evt: any) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    setValidated(true);
    const response = await fetch(`${API_ENDPOINT}/tokens`, {
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
  const [disabledRemoves] = useState(() => new Map<string, boolean>());
  const handleRemoveToken = async (address_id: string) => {
    disabledRemoves.set(address_id, true);
    if (await confirm('Are you sure?')) {
      try {
        const response = await fetch(`${API_ENDPOINT}/tokens/${address_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': accessToken,
          },
          method: 'DELETE',
        });
        if (response.ok) {
          toast.info('Token deleted successfully');
          setVersion(version + 1);
        } else {
          toast.error("Token wasn't removed. An error has occured");
        }
      } catch (error) {
        toast.error("Token wasn't removed. A network problem has occured");
      }
    }
    disabledRemoves.set(address_id, false);
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Add new token:</h5>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <AdminFormInput handleChange={handleChange} label="Address" name="address_id" value={values?.address_id} />
          <AdminFormInput handleChange={handleChange} label="Symbol" name="symbol" value={values?.symbol} />
          <AdminFormInput handleChange={handleChange} label="Icon url" name="icon" value={values?.icon} />
        </Row>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
      <h5 className="mt-3">Current tokens:</h5>
      <Table className="mt-3" striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Address</th>
            <th>Symbol</th>
            <th>Icon url</th>
            <th>
              <IoMenuOutline size={20} />
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.map((token) => (
            <tr key={token.address_id}>
              <td>{token.address_id}</td>
              <td>{token.symbol}</td>
              <td>{token.icon}</td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle id="dropdown-basic">
                    <IoMenuOutline size={20} />
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item href="#/action-1">
                      <Button
                        variant="primary"
                        disabled={disabledRemoves.get(token.address_id) ?? false}
                        onClick={() => handleRemoveToken(token.address_id)}
                      >
                        <IoTrashOutline size={20} /> Remove
                      </Button>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminFormLayout>
  );
}

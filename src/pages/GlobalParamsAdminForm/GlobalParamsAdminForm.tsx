import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import AdminFormLayout from '../AdminFormLayout';

interface GlobalParams {
  max_usd: number;
  max_usdr: number;
  max_deposit_cap: number;
  max_borrow: number;
  price_interval: number;
}

export default function GlobalParamsAdminForm() {
  const [validated, setValidated] = useState(false);
  const defaultValues: GlobalParams = {
    max_usd: 0,
    max_usdr: 0,
    max_deposit_cap: 0,
    max_borrow: 0,
    price_interval: 0,
  };
  const [data, setData] = useState<GlobalParams>(defaultValues);

  const handleChange = (event: any) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
  };

  const { accessToken } = useAuthContextProvider();

  const parseJsonResponse = (result: any): any => {
    if (Array.isArray(result)) {
      let ratios: GlobalParams = defaultValues;
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        ratios = {
          ...ratios,
          [Object.keys(element)[0]]: Object.values(element)[0],
        };
      }
      return ratios;
    }
    return result;
  };

  const fetchData = useCallback(async () => {
    const response = await fetch(`${API_ENDPOINT}/ratioconfig/general`, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': JSON.stringify(accessToken),
      },
      method: 'GET',
    });
    if (!response.ok) {
      throw await response.json();
    }
    return parseJsonResponse(await response.json());
  }, []);

  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };

    async function load() {
      const res = await fetchData();
      if (!active) {
        return;
      }
      setData(res);
    }
  }, [fetchData]);

  const handleSubmit = async (evt: any) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    setValidated(true);
    const response = await fetch(`${API_ENDPOINT}/ratioconfig/general`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': accessToken,
      },
      method: 'POST',
    });
    setValidated(false);
    if (!response.ok) {
      toast.error('An error ocurred while saving the parameters');
      throw await response.json();
    }
    setData(parseJsonResponse(await response.json()));
    toast.info('Parameters saved successfully');
    return;
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Modify Global Parameters Values:</h5>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <AdminFormInput handleChange={handleChange} label="Max Borrow" name="max_borrow" value={data?.max_borrow} />
          <AdminFormInput
            handleChange={handleChange}
            label="Max Deposit cap"
            name="max_deposit_cap"
            value={data?.max_deposit_cap}
          />
          <AdminFormInput handleChange={handleChange} label="Max USD" name="max_usd" value={data?.max_usd} />
          <AdminFormInput handleChange={handleChange} label="Max USDR" name="max_usdr" value={data?.max_usdr} />
          <AdminFormInput
            handleChange={handleChange}
            label="Price interval"
            name="price_interval"
            value={data?.price_interval}
          />
        </Row>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
    </AdminFormLayout>
  );
}

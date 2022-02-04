import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import AdminFormLayout from '../AdminFormLayout';

interface Fees {
  borrow_fee: number;
  deposit_fee: number;
  payback_fee: number;
  reward_fee: number;
  stake_fee: number;
  swap_fee: number;
  withdraw_fee: number;
}

export default function FeesAdminForm() {
  const [validated, setValidated] = useState(false);
  const defaultValues: Fees = {
    borrow_fee: 0,
    deposit_fee: 0,
    payback_fee: 0,
    reward_fee: 0,
    stake_fee: 0,
    swap_fee: 0,
    withdraw_fee: 0,
  };
  const [data, setData] = useState<Fees>(defaultValues);

  const handleChange = (event: any) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
  };

  const { accessToken } = useAuthContextProvider();

  const parseJsonResponse = (result: any): any => {
    if (Array.isArray(result)) {
      let ratios: Fees = defaultValues;
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
    const response = await fetch(`${API_ENDPOINT}/ratioconfig/transfees/last`, {
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
    const response = await fetch(`${API_ENDPOINT}/ratioconfig/transfees`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': accessToken,
      },
      method: 'POST',
    });
    setValidated(false);
    if (!response.ok) {
      toast.error('An error ocurred while saving the fees');
      throw await response.json();
    }
    setData(parseJsonResponse(await response.json()));
    toast.info('Fees saved successfully');
    return;
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Modify Fees Values:</h5>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <AdminFormInput handleChange={handleChange} label="Borrow" name="borrow_fee" value={data?.borrow_fee} />
          <AdminFormInput handleChange={handleChange} label="Deposit" name="deposit_fee" value={data?.deposit_fee} />
          <AdminFormInput handleChange={handleChange} label="Payback" name="payback_fee" value={data?.payback_fee} />
          <AdminFormInput handleChange={handleChange} label="Rewards" name="reward_fee" value={data?.reward_fee} />
          <AdminFormInput handleChange={handleChange} label="Stake" name="stake_fee" value={data?.stake_fee} />
          <AdminFormInput handleChange={handleChange} label="Swap" name="swap_fee" value={data?.swap_fee} />
          <AdminFormInput handleChange={handleChange} label="Withdraw" name="withdraw_fee" value={data?.withdraw_fee} />
        </Row>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
    </AdminFormLayout>
  );
}

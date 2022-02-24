import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { CollateralizationRatios } from '../../types/admin-types';
import { setCollateralRatio } from '../../utils/admin-contract-calls';
import AdminFormLayout from '../AdminFormLayout';

export default function CollRatiosAdminForm() {
  const [validated, setValidated] = useState(false);
  const defaultValues: CollateralizationRatios = {
    cr_aaa_ratio: 0,
    cr_aa_ratio: 0,
    cr_a_ratio: 0,
    cr_bbb_ratio: 0,
    cr_bb_ratio: 0,
    cr_b_ratio: 0,
    cr_ccc_ratio: 0,
    cr_cc_ratio: 0,
    cr_c_ratio: 0,
    cr_d_ratio: 0,
  };
  const [data, setData] = useState<CollateralizationRatios>(defaultValues);

  const handleChange = (event: any) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
  };

  const { accessToken } = useAuthContextProvider();

  const parseJsonResponse = (result: any): any => {
    if (Array.isArray(result)) {
      let ratios: CollateralizationRatios = defaultValues;
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
    const response = await fetch(`${API_ENDPOINT}/ratioconfig/collateralratio/last`, {
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

  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;

  const updateDatabaseValues = async () => {
    const response = await fetch(`${API_ENDPOINT}/ratioconfig/collateralratio`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': accessToken,
      },
      method: 'POST',
    });
    setValidated(false);
    if (!response.ok) {
      toast.error('An error ocurred while saving the ratios');
      throw await response.json();
    }
    setData(parseJsonResponse(await response.json()));
  };

  const handleSubmit = async (evt: any) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    setValidated(true);
    await setCollateralRatio(connection, wallet, data);
    await updateDatabaseValues();
    toast.info('Ratios saved successfully');
    return;
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Modify Collateralization Ratios Values:</h5>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <AdminFormInput
            handleChange={handleChange}
            label="AAA rating"
            name="cr_aaa_ratio"
            value={data?.cr_aaa_ratio}
          />
          <AdminFormInput handleChange={handleChange} label="AA rating" name="cr_aa_ratio" value={data?.cr_aa_ratio} />
          <AdminFormInput handleChange={handleChange} label="A rating" name="cr_a_ratio" value={data?.cr_a_ratio} />
          <AdminFormInput
            handleChange={handleChange}
            label="BBB rating"
            name="cr_bbb_ratio"
            value={data?.cr_bbb_ratio}
          />
          <AdminFormInput handleChange={handleChange} label="BB rating" name="cr_bb_ratio" value={data?.cr_bb_ratio} />
          <AdminFormInput handleChange={handleChange} label="B rating" name="cr_b_ratio" value={data?.cr_b_ratio} />
          <AdminFormInput
            handleChange={handleChange}
            label="CCC rating"
            name="cr_ccc_ratio"
            value={data?.cr_ccc_ratio}
          />
          <AdminFormInput handleChange={handleChange} label="CC rating" name="cr_cc_ratio" value={data?.cr_cc_ratio} />
          <AdminFormInput handleChange={handleChange} label="C rating" name="cr_c_ratio" value={data?.cr_c_ratio} />
          <AdminFormInput handleChange={handleChange} label="D rating" name="cr_d_ratio" value={data?.cr_d_ratio} />
        </Row>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
    </AdminFormLayout>
  );
}

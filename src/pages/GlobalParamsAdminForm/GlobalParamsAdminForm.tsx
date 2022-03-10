import { Connection } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import { useConnection } from '../../contexts/connection';
import { useWallet, WalletAdapter } from '../../contexts/wallet';
import { useSuperOwner } from '../../hooks/useSuperOwner';
import { IIndexable } from '../../types/admin-types';
import {
  getGlobalDebtCeiling,
  getGlobalTVLLimit,
  getUserDebtCeiling,
  setGlobalDebtCeiling,
  setGlobalTvlLimit,
  setUserDebtCeiling,
} from '../../utils/admin-contract-calls';
import AdminFormLayout from '../AdminFormLayout';

interface GlobalParams {
  global_max_usdr: number;
  user_max_usdr: number;
  global_max_deposit: number;
  price_interval: number;
}
interface GlobalParamsChanged {
  global_max_usdr: boolean;
  user_max_usdr: boolean;
  global_max_deposit: boolean;
  price_interval: boolean;
}
const ContractUpdatersMap = {
  global_max_usdr: async (connection: Connection, wallet: WalletAdapter, data: GlobalParams) => {
    await setGlobalDebtCeiling(connection, wallet, Number(data.global_max_usdr));
  },
  user_max_usdr: async (connection: Connection, wallet: WalletAdapter, data: GlobalParams) => {
    await setUserDebtCeiling(connection, wallet, Number(data.user_max_usdr));
  },
  global_max_deposit: async (connection: Connection, wallet: WalletAdapter, data: GlobalParams) => {
    await setGlobalTvlLimit(connection, wallet, Number(data.global_max_deposit));
  },
  // eslint-disable-next-line
  price_interval: async (connection: Connection, wallet: WalletAdapter, data: GlobalParams) => {}, // There's no update on the contract side for this property
};

export default function GlobalParamsAdminForm() {
  const [validated, setValidated] = useState(false);
  const defaultValues: GlobalParams = {
    global_max_usdr: 0,
    user_max_usdr: 0,
    global_max_deposit: 0,
    price_interval: 0,
  };
  const defaultValuesTrackers: GlobalParamsChanged = {
    global_max_usdr: false,
    user_max_usdr: false,
    global_max_deposit: false,
    price_interval: false,
  };
  const [data, setData] = useState<GlobalParams>(defaultValues);
  const superOwner = useSuperOwner();
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;
  const [changedTracker, setChangedTracker] = useState<GlobalParamsChanged>(defaultValuesTrackers);

  const handleChange = (event: any) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
    setChangedTracker((values) => ({
      ...values,
      [event.target.name]: true,
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

  useEffect(() => {
    let active = true;
    getGlobalTVLLimit(connection, wallet).then((res) => {
      if (!active) {
        return;
      }
      setData((prev) => {
        return {
          ...prev,
          global_max_deposit: res,
        };
      });
    });
    return () => {
      active = false;
    };
  }, [getGlobalTVLLimit]);

  useEffect(() => {
    let active = true;
    getGlobalDebtCeiling(connection, wallet).then((res) => {
      if (!active) {
        return;
      }
      setData((prev) => {
        return {
          ...prev,
          global_max_usdr: res,
        };
      });
    });
    return () => {
      active = false;
    };
  }, [getGlobalDebtCeiling]);

  useEffect(() => {
    let active = true;
    getUserDebtCeiling(connection, wallet).then((res) => {
      if (!active) {
        return;
      }
      setData((prev) => {
        return {
          ...prev,
          user_max_usdr: res,
        };
      });
    });
    return () => {
      active = false;
    };
  }, [getUserDebtCeiling]);

  const fetchData = useCallback(async () => {
    const response = await fetch(`${API_ENDPOINT}/ratioconfig/general/last`, {
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
      setData((prev) => {
        return {
          ...prev,
          price_interval: res.price_interval,
        };
      });
    }
  }, [fetchData]);

  const updateContractValues = async () => {
    if (wallet?.publicKey?.toBase58() !== superOwner) {
      toast.error('Connected user is not the contract authority');
      throw 'Connected user is not the contract authority';
    }
    await Promise.all(
      Object.keys(data)
        .filter((item) => (changedTracker as IIndexable)[item])
        .map(async (item) => {
          await (ContractUpdatersMap as IIndexable)[item](connection, wallet, data);
        })
    );
  };

  const handleSubmit = async (evt: any) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    setValidated(true);
    try {
      await updateContractValues();
    } catch (error) {
      console.error('There was an error when updating the contract values', error);
      toast.error('There was an error when updating the contract values');
      return;
    }
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
        <div className="text-right">
          <label>Current superowner:&nbsp;</label>
          <span>{superOwner}</span>
        </div>
        <Row className="mb-3">
          <AdminFormInput
            handleChange={handleChange}
            label="Global max usdr"
            name="global_max_usdr"
            value={data?.global_max_usdr}
          />
          <AdminFormInput
            handleChange={handleChange}
            label="User max usdr"
            name="user_max_usdr"
            value={data?.user_max_usdr}
          />
          <AdminFormInput
            handleChange={handleChange}
            label="Global max deposit"
            name="global_max_deposit"
            value={data?.global_max_deposit}
          />
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

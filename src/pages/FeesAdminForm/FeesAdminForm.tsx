import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Button, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import { useConnection } from '../../contexts/connection';
import { useRFStateInfo } from '../../contexts/state';
import { useWallet, WalletAdapter } from '../../contexts/wallet';
import { IIndexable } from '../../types/admin-types';
import {
  setBorrowFee,
  setDepositFee,
  setHarvestFee,
  setPaybackFee,
  setStakeFee,
  setSwapFee,
  setWithdrawFee,
} from '../../utils/ratio-lending-admin';
import AdminFormLayout from '../AdminFormLayout';

interface Fees {
  borrow_fee: number;
  deposit_fee: number;
  payback_fee: number;
  stake_fee: number;
  swap_fee: number;
  withdraw_fee: number;
  harvest_fee: number;
}

// Tracks if a certain field has been changed.
interface FeesChanged {
  borrow_fee: boolean;
  deposit_fee: boolean;
  payback_fee: boolean;
  stake_fee: boolean;
  swap_fee: boolean;
  withdraw_fee: boolean;
  harvest_fee: boolean;
}
const ContractUpdatersMap = {
  borrow_fee: async (connection: Connection, wallet: WalletAdapter, data: Fees) =>
    await setBorrowFee(connection, wallet, Number(data?.borrow_fee)),
  deposit_fee: async (connection: Connection, wallet: WalletAdapter, data: Fees) =>
    await setDepositFee(connection, wallet, Number(data?.deposit_fee)),
  payback_fee: async (connection: Connection, wallet: WalletAdapter, data: Fees) =>
    await setPaybackFee(connection, wallet, Number(data?.payback_fee)),
  harvest_fee: async (connection: Connection, wallet: WalletAdapter, data: Fees) =>
    await setHarvestFee(connection, wallet, Number(data?.harvest_fee)),
  stake_fee: async (connection: Connection, wallet: WalletAdapter, data: Fees) =>
    await setStakeFee(connection, wallet, Number(data?.stake_fee)),
  swap_fee: async (connection: Connection, wallet: WalletAdapter, data: Fees) =>
    await setSwapFee(connection, wallet, Number(data?.swap_fee)),
  withdraw_fee: async (connection: Connection, wallet: WalletAdapter, data: Fees) =>
    await setWithdrawFee(connection, wallet, Number(data?.withdraw_fee)),
};

export default function FeesAdminForm() {
  const [validated, setValidated] = useState(false);
  const defaultValues: Fees = {
    borrow_fee: 0,
    deposit_fee: 0,
    payback_fee: 0,
    stake_fee: 0,
    swap_fee: 0,
    withdraw_fee: 0,
    harvest_fee: 0,
  };
  const defaultValuesTrackers: FeesChanged = {
    borrow_fee: false,
    deposit_fee: false,
    payback_fee: false,
    stake_fee: false,
    swap_fee: false,
    withdraw_fee: false,
    harvest_fee: false,
  };
  const [data, setData] = useState<Fees>(defaultValues);
  const [changedTracker, setChangedTracker] = useState<FeesChanged>(defaultValuesTrackers);

  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;

  const globalState = useRFStateInfo();
  const superOwner = globalState ? globalState.authority.toString() : '';

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

  useEffect(() => {
    if (globalState) {
      setData((prev) => {
        return {
          ...prev,
          harvest_fee: (globalState.harvestFeeNumer.toNumber() / globalState.feeDeno.toNumber()) * 100,
          borrow_fee: (globalState.borrowFeeNumer.toNumber() / globalState.feeDeno.toNumber()) * 100,
        };
      });
    }
  }, [globalState]);

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

  const updateDatabaseValues = async () => {
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
      await updateDatabaseValues();
      setChangedTracker(defaultValuesTrackers);
      toast.info('Fees saved successfully');
    } catch (error: unknown) {
      toast.error('There was an error when saving the values');
      throw error;
    }
    return;
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Modify Fees Values(%):</h5>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <AdminFormInput handleChange={handleChange} label="Borrow" name="borrow_fee" value={data?.borrow_fee} />
          <AdminFormInput
            yetNotImplemented={true}
            handleChange={handleChange}
            label="Deposit"
            name="deposit_fee"
            value={data?.deposit_fee}
          />
          <AdminFormInput
            yetNotImplemented={true}
            handleChange={handleChange}
            label="Payback"
            name="payback_fee"
            value={data?.payback_fee}
          />
          <AdminFormInput
            yetNotImplemented={true}
            handleChange={handleChange}
            label="Stake"
            name="stake_fee"
            value={data?.stake_fee}
          />
          <AdminFormInput
            yetNotImplemented={true}
            handleChange={handleChange}
            label="Withdraw"
            name="withdraw_fee"
            value={data?.withdraw_fee}
          />
          <AdminFormInput handleChange={handleChange} label="Harvest" name="harvest_fee" value={data?.harvest_fee} />
        </Row>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
    </AdminFormLayout>
  );
}

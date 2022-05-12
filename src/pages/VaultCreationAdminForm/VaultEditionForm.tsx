import { Connection, PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Form, Row, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import { useConnection } from '../../contexts/connection';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { useWallet } from '../../contexts/wallet';
import { useFetchPlatforms } from '../../hooks/useFetchPlatforms';

import { FetchingStatus } from '../../types/fetching-types';
import { LPAssetCreationData, LPEditionData, RISK_RATING } from '../../types/VaultTypes';
import { createPool } from '../../utils/admin-contract-calls';
import { getLendingPoolByMint, TYPE_ID_SABER } from '../../utils/ratio-lending';
import LPAssetAdditionModal from './LPAssetAdditionModal/LPAssetAdditionModal';
import { getPoolPDA } from '../../utils/ratio-pda';
import { useRFStateInfo } from '../../contexts/state';

interface VaultEditionFormProps {
  values: LPEditionData;
  onSave?: () => void;
}

interface PoolData {
  mintA: string;
  mintB: string;
  accountA: string;
  accountB: string;
  mintReward: string;
}

export default function VaultEditionForm({ values, onSave = () => {} }: VaultEditionFormProps) {
  const globalState = useRFStateInfo();
  const superOwner = globalState ? globalState.authority.toString() : '';

  const [validated, setValidated] = useState(false);
  const [data, setData] = useState<LPEditionData>({
    ...values,
    address_id: '',
  });
  const [poolData, setPoolData] = useState<PoolData>({
    mintA: '',
    mintB: '',
    accountA: '',
    accountB: '',
    mintReward: 'iouQcQBAiEXe6cKLS85zmZxUqaCqBdeHFpqKoSz615u',
  });
  const { accessToken } = useAuthContextProvider();
  const { data: platforms, status: platformFetchStatus, error: platformFetchError } = useFetchPlatforms();
  const { forceUpdate } = useVaultsContextProvider();
  const [showModal, setShowModal] = useState(false);
  const connection = useConnection();
  const { wallet } = useWallet();
  const resetValues = () => {
    setData(values);
    setValidated(false);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
  };

  const handlePoolChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPoolData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
  };

  const getOrCreateTokenVault = async (connection: Connection, data: LPEditionData): Promise<PublicKey | undefined> => {
    if (await getLendingPoolByMint(connection, data?.address_id)) {
      toast.info('Token vault program already exists');
    } else {
      try {
        if (wallet?.publicKey?.toBase58()?.toLowerCase() !== superOwner?.toLowerCase()) {
          toast.error("Can't create vault, connected user is not the contract authority");
          return;
        }
        const riskRatingValue: number = RISK_RATING[data?.risk_rating as keyof typeof RISK_RATING];
        const platformName: string | undefined = platforms?.find((item) => item.id === data.platform_id)?.name;
        if (!platformName) {
          toast.error('Platform needs to be selected to create a vault');
          return;
        }
        const result = await createPool(
          connection,
          wallet,
          new PublicKey(data?.address_id), // mintCollKey
          riskRatingValue,
          TYPE_ID_SABER,
          poolData.mintReward,
          poolData.mintA,
          poolData.mintB,
          poolData.accountA,
          poolData.accountB
        );
        if (!result) {
          toast.error('There was an error when creating the token vault program');
          return;
        }
      } catch (error) {
        console.error(error);
      }
      if (await getLendingPoolByMint(connection, data?.address_id)) {
        toast.info('Token vault program created successfully');
      }
    }
    const vaultProgramAddress = await getPoolPDA(data?.address_id);
    if (!vaultProgramAddress) {
      toast.error("Couldn't get the vault's address");
      return;
    }
    return vaultProgramAddress;
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    setValidated(true);
    const vaultProgramAddress = await getOrCreateTokenVault(connection, data);
    if (!vaultProgramAddress) {
      return;
    }
    data.vault_address_id = vaultProgramAddress.toBase58();
    const response = await fetch(`${API_ENDPOINT}/lpairs/${data.address_id}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': accessToken,
      },
      method: 'POST',
    });
    if (!response.ok) {
      toast.error('An error ocurred while saving the LPair');
      throw await response.json();
    }
    resetValues();
    forceUpdate();
    toast.info('LPair saved successfully');
    onSave();
  };
  const handleAddTokenAsset = async (asset: LPAssetCreationData) => {
    const assets = data.lpasset;
    assets.push(asset);
    setData((values) => ({
      ...values,
      lpasset: assets,
    }));
  };
  useEffect(() => {
    if (platformFetchStatus === FetchingStatus.Error) {
      toast.error(`There was an error when fetching the platforms: ${platformFetchError}`);
    }
  }, [platformFetchStatus]);
  return (
    <>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <AdminFormInput handleChange={handleChange} label="LP Address" name="address_id" value={data?.address_id} />
          <AdminFormInput
            handleChange={handlePoolChange}
            label="Token A Address"
            name="mintA"
            value={poolData?.mintA}
          />
          <AdminFormInput
            handleChange={handlePoolChange}
            label="Token B Address"
            name="mintB"
            value={poolData?.mintB}
          />
          <AdminFormInput
            handleChange={handlePoolChange}
            label="Token A Reserves"
            name="accountA"
            value={poolData?.accountA}
          />
          <AdminFormInput
            handleChange={handlePoolChange}
            label="Token B Reserves"
            name="accountB"
            value={poolData?.accountB}
          />
          <AdminFormInput
            handleChange={handlePoolChange}
            label="Reward Mint"
            name="mintReward"
            value={poolData?.mintReward}
          />
          <AdminFormInput handleChange={handleChange} label="Symbol" name="symbol" value={data?.symbol} />
          <AdminFormInput
            handleChange={handleChange}
            label="Page url"
            required={false}
            name="page_url"
            value={data?.page_url}
          />
          <AdminFormInput
            handleChange={handleChange}
            label="Icon url"
            required={false}
            name="icon"
            value={data?.icon}
          />
          <AdminFormInput
            handleChange={handleChange}
            label="Platform"
            as="select"
            name="platform_id"
            value={data?.platform_id ?? ''}
          >
            <option key="" disabled value="">
              -Select option-
            </option>
            {platforms?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </AdminFormInput>
          <AdminFormInput
            handleChange={handleChange}
            label="Platform's symbol"
            required={true}
            name="platform_symbol"
            value={data?.platform_symbol}
          />
          <AdminFormInput
            handleChange={handleChange}
            label="Risk rating"
            as="select"
            name="risk_rating"
            value={data?.risk_rating?.toString() ?? ''}
          >
            <option key="" disabled value="">
              -Select option-
            </option>
            {Object.keys(RISK_RATING)
              .filter((value) => isNaN(Number(value)))
              .map((item) => (
                <option key={item} value={item.toString()}>
                  {item}
                </option>
              ))}
          </AdminFormInput>
        </Row>
        {/* <Row>
          <Button variant="info" className="float-end" type="button" onClick={() => setShowModal(true)}>
            Add token to vault
          </Button>
          <Table className="mt-3" striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Token</th>
                <th>Pool size</th>
              </tr>
            </thead>
            <tbody>
              {data?.lpasset?.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center">
                    The vault has no tokens added
                  </td>
                </tr>
              )}
              {data?.lpasset?.length > 0 &&
                data.lpasset.map((item) => (
                  <tr key={item.token_address_id}>
                    <td key={item.token_address_id}>{item.token_address_id}</td>
                    <td key={item.token_pool_size}>{item.token_pool_size}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Row> */}
        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
      <LPAssetAdditionModal
        show={showModal}
        close={() => setShowModal(false)}
        onAdd={handleAddTokenAsset}
      ></LPAssetAdditionModal>
    </>
  );
}

import { Connection, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import { useConnection } from '../../contexts/connection';
import { useVaultsContextProvider } from '../../contexts/vaults';
import { useWallet } from '../../contexts/wallet';
import { VaultsFetchingStatus } from '../../hooks/useFetchVaults';
import { useSuperOwner } from '../../hooks/useSuperOwner';
import { Platform, RISK_RATING } from '../../types/VaultTypes';
import { createGlobalState, createTokenVault } from '../../utils/admin-contract-calls';
import { getTokenVaultAddress, getTokenVaultByMint, isGlobalStateCreated } from '../../utils/ratio-lending';
import AdminFormLayout from '../AdminFormLayout';
import LPAssetAdditionModal, { LPAssetCreationData } from './LPAssetAdditionModal/LPAssetAdditionModal';

interface LPCreationData {
  address_id: string;
  vault_address_id: string | null;
  page_url: string | null;
  icon: string | null;
  platform_id: string | null;
  platform_symbol: string | null;
  pool_size: number | null;
  symbol: string | null;
  collateralization_ratio: number | null;
  liquidation_ratio: number | null;
  risk_rating: string | null;
  lpasset: LPAssetCreationData[];
}

export default function VaultCreationAdminForm() {
  const [validated, setValidated] = useState(false);
  const [globalStateCreated, setGlobalStateCreated] = useState(false);
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;
  const superOwner = useSuperOwner();

  const onCreateProgramState = async () => {
    await createGlobalState(connection, wallet);
    setGlobalStateCreated(await isGlobalStateCreated(connection, wallet));
  };
  useEffect(() => {
    if (gWallet.connected) {
      isGlobalStateCreated(connection, wallet).then((result) => {
        setGlobalStateCreated(result);
      });
    }
  }, [gWallet.connected]);
  const defaultValues: LPCreationData = {
    address_id: '',
    vault_address_id: '',
    page_url: '',
    icon: '',
    platform_id: '',
    platform_symbol: '',
    pool_size: 0,
    symbol: '',
    collateralization_ratio: 0,
    liquidation_ratio: 0,
    risk_rating: '',
    lpasset: [],
  };
  const [data, setData] = useState<LPCreationData>(defaultValues);
  const [showModal, setShowModal] = useState(false);
  const { accessToken } = useAuthContextProvider();
  const fetchPlatforms = useCallback(async (): Promise<Platform[]> => {
    const response = await fetch(`${API_ENDPOINT}/platforms`, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': JSON.stringify(accessToken),
      },
      method: 'GET',
    });
    if (!response.ok) {
      throw await response.json();
    }
    return response.json();
  }, [accessToken]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };
    async function load() {
      const res = await fetchPlatforms();
      if (!active) {
        return;
      }
      setPlatforms(res);
    }
  }, [fetchPlatforms]);
  const { status, error, vaults, forceUpdate } = useVaultsContextProvider();
  const resetValues = () => {
    setData(defaultValues);
    setValidated(false);
  };
  const handleChange = (event: any) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
  };

  const getOrCreateTokenVault = async (
    connection: Connection,
    data: LPCreationData
  ): Promise<PublicKey | undefined> => {
    if (await getTokenVaultByMint(connection, data?.address_id)) {
      toast.info('Token vault program already exists');
    } else {
      try {
        if (wallet?.publicKey?.toBase58() !== superOwner) {
          toast.error("Can't create vault, connected user is not the contract authority");
          return;
        }
        const riskRatingValue: number = RISK_RATING[data?.risk_rating as keyof typeof RISK_RATING];
        const platformName: string | undefined = platforms.find((item) => item.id === data.platform_id)?.name;
        if (!platformName) {
          toast.error('Platform needs to be selected to create a vault');
          return;
        }
        const result = await createTokenVault(
          connection,
          wallet,
          new PublicKey(data?.address_id),
          riskRatingValue,
          platformName
        );
        if (!result) {
          toast.error('There was an error when creating the token vault program');
          return;
        }
      } catch (error: any) {
        console.error(error);
      }
      (await getTokenVaultByMint(connection, data?.address_id)) &&
        toast.info('Token vault program created successfully');
    }
    const vaultProgramAddress = await getTokenVaultAddress(data?.address_id);
    if (!vaultProgramAddress) {
      toast.error("Couldn't get the vault's address");
      return;
    }
    return vaultProgramAddress;
  };

  const handleSubmit = async (evt: any) => {
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
    toast.info('LPair added successfully');
  };
  const handleAddTokenAsset = async (asset: LPAssetCreationData) => {
    const assets = data.lpasset;
    assets.push(asset);
    setData((values) => ({
      ...values,
      lpasset: assets,
    }));
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Add new vault:</h5>
      {!globalStateCreated && (
        <div className="global-state-not-found-container">
          <p>Global state was not found, it needs to be created in order to create vaults.</p>
          <Button className="button--fill mt-4" onClick={onCreateProgramState} disabled={globalStateCreated}>
            Create Program State
          </Button>
        </div>
      )}
      {globalStateCreated && (
        <Form validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <AdminFormInput handleChange={handleChange} label="LP Address" name="address_id" value={data?.address_id} />
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
          <Row>
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
                {data.lpasset.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center">
                      The vault has no tokens added
                    </td>
                  </tr>
                )}
                {data.lpasset.length > 0 &&
                  data.lpasset.map((item) => (
                    <tr key={item.token_address_id}>
                      <td key={item.token_address_id}>{item.token_address_id}</td>
                      <td key={item.token_pool_size}>{item.token_pool_size}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Row>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      )}
      <h5 className="mt-3">Current vaults:</h5>
      {status === VaultsFetchingStatus.Error && toast.error(error)}
      {(status === VaultsFetchingStatus.Loading || status === VaultsFetchingStatus.NotAsked) && (
        <LoadingSpinner className="spinner-border-lg text-info" />
      )}
      {status === VaultsFetchingStatus.Finish && (
        <Table className="mt-3" striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Vault address</th>
              <th>LP mint address</th>
              <th>Name</th>
              <th>Created on</th>
              <th>Platform</th>
              <th>Risk rating</th>
            </tr>
          </thead>
          <tbody>
            {vaults?.map((item) => (
              <tr key={item.address_id}>
                <td>{item.vault_address_id}</td>
                <td>{item.address_id}</td>
                <td>{item.symbol}</td>
                <td>{item.created_on}</td>
                <td>{item.platform_name}</td>
                <td>{item.risk_rating}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <LPAssetAdditionModal
        show={showModal}
        close={() => setShowModal(false)}
        onAdd={handleAddTokenAsset}
      ></LPAssetAdditionModal>
    </AdminFormLayout>
  );
}

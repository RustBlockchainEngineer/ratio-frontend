import { PublicKey } from '@solana/web3.js';
import React, { useState } from 'react';
import { Button, Dropdown, Form, Row, Col, Table } from 'react-bootstrap';
import { IoMenuOutline, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import AdminFormInput from '../../components/AdminFormInput';
import { API_ENDPOINT } from '../../constants/constants';
import { useAuthContextProvider } from '../../contexts/authAPI';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { useFetchData } from '../../hooks/useFetchData';
import { useFetchPlatforms } from '../../hooks/useFetchPlatforms';
import { TokenCreation, TokenSource } from '../../types/admin-types';
import { FetchingStatus } from '../../types/fetching-types';
import { createPriceOracle, getPriceOracle } from '../../utils/ratio-lending-admin';
import AdminFormLayout from '../AdminFormLayout';
import PlatformAdditionModal from './PlatformAdditionModal';
import PriceSourceAdditionModal from './PriceSourceAdditionModal';

export default function TokensAdminForm() {
  const [version, setVersion] = React.useState(0);
  const [validated, setValidated] = useState(false);
  const [showPlatformAdditionModal, setShowPlatformAdditionModal] = useState(false);
  const [showPriceSourceAdditionModal, setShowPriceSourceAdditionModal] = useState(false);
  const { data: platforms, status: platformFetchStatus, error: platformFetchError } = useFetchPlatforms();
  const connection = useConnection();
  const { wallet } = useWallet();
  const {
    data: sources,
    status: sourcesFetchStatus,
    error: sourcesFetchError,
  } = useFetchData<string[]>('/tokens/pricessources');
  const { data: tokens } = useFetchData<TokenCreation[]>('/tokens');

  const defaultValues: TokenCreation = {
    address_id: '',
    symbol: '',
    icon: '',
    platforms: [],
    token_ids: [],
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

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    try {
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
        toast.error(`There was a problem when saving the token: ${await response.json()}`);
        throw await response.json();
      }
      resetValues();
      setVersion(version + 1);
      toast.info('Token was saved successfully');
      return response.json();
    } catch {
      toast.error('There was a problem when saving the token');
    }
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
  const handleLinkPlatform = async (platformId: string) => {
    const platforms = values.platforms;
    platforms.push({ id: platformId });
    setValues((values) => ({
      ...values,
      platforms: platforms,
    }));
  };
  const handleAddSource = async (newSource: TokenSource) => {
    const prev = values.token_ids;
    prev.push(newSource);
    setValues((values) => ({
      ...values,
      token_ids: prev,
    }));
  };
  const createNewPriceOracle = async () => {
    try {
      if (values && values.address_id) {
        if (await getPriceOracle(connection, wallet, new PublicKey(values.address_id))) {
          toast.error('This oracle exists already!');
        } else {
          await createPriceOracle(connection, wallet, new PublicKey(values.address_id));
          toast.success('New oracle has been created successfully!');
        }
      } else {
        toast.error('Input token address!');
      }
    } catch (e) {
      toast.error('Creating new oracle is failed!');
    }
  };
  return (
    <AdminFormLayout>
      {platformFetchStatus === FetchingStatus.Error &&
        toast.error(`There was an error when fetching the platforms: ${platformFetchError}`)}
      {sourcesFetchStatus === FetchingStatus.Error &&
        toast.error(`There was an error when fetching the platforms: ${sourcesFetchError}`)}
      <h5 className="mt-3">Add new token:</h5>
      <Form validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <AdminFormInput handleChange={handleChange} label="Address" name="address_id" value={values?.address_id} />
          <AdminFormInput handleChange={handleChange} label="Symbol" name="symbol" value={values?.symbol} />
          <AdminFormInput handleChange={handleChange} label="Icon url" name="icon" value={values?.icon} />
        </Row>
        <Row>
          <Col>
            <Button
              variant="info"
              className="float-end"
              type="button"
              onClick={() => setShowPriceSourceAdditionModal(true)}
            >
              Add a price source for this token
            </Button>
            &nbsp;
            <Button variant="info" className="float-end" type="button" onClick={() => createNewPriceOracle()}>
              Create Price Oracle
            </Button>
          </Col>
          <Table className="mt-3" striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Source token Id</th>
                <th>Source Name</th>
              </tr>
            </thead>
            <tbody>
              {values.token_ids.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center">
                    The token has no source yet
                  </td>
                </tr>
              )}
              {values.token_ids.length > 0 &&
                values.token_ids.map((item) => {
                  return (
                    <tr key={item.token_id}>
                      <td key={item.token_id}>{item.token_id}</td>
                      <td key={item.source}>{item.source}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Row>
        <Row>
          <Button variant="info" className="float-end" type="button" onClick={() => setShowPlatformAdditionModal(true)}>
            Link a platform to this token
          </Button>
          <Table className="mt-3" striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Platform Id</th>
                <th>Platform Name</th>
              </tr>
            </thead>
            <tbody>
              {values.platforms.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center">
                    The token is not linked to any platform
                  </td>
                </tr>
              )}
              {values.platforms.length > 0 &&
                values.platforms.map((item) => {
                  const platformName = platforms?.find((platform) => platform.id === item.id)?.name;
                  return (
                    <tr key={item.id}>
                      <td key={item.id}>{item.id}</td>
                      <td key={platformName}>{platformName}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
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
            <th>Platforms</th>
            <th>Sources</th>
            <th>
              <IoMenuOutline size={20} />
            </th>
          </tr>
        </thead>
        <tbody>
          {tokens?.map((token) => (
            <tr key={token.address_id}>
              <td>{token.address_id}</td>
              <td>{token.symbol}</td>
              <td>{token.icon}</td>
              <td>
                {token.platforms
                  .map((item) => {
                    return platforms?.find((platform) => platform.id === item.id)?.name;
                  })
                  .join(',')}
              </td>
              <td>
                {token.token_ids
                  .map((item) => {
                    return `${item.source}(${item.token_id})`;
                  })
                  .join(',')}
              </td>
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
      <PlatformAdditionModal
        show={showPlatformAdditionModal}
        platforms={platforms ?? []}
        close={() => setShowPlatformAdditionModal(false)}
        onAdd={handleLinkPlatform}
      ></PlatformAdditionModal>
      <PriceSourceAdditionModal
        show={showPriceSourceAdditionModal}
        sources={sources ?? []}
        close={() => setShowPriceSourceAdditionModal(false)}
        onAdd={handleAddSource}
      ></PriceSourceAdditionModal>
    </AdminFormLayout>
  );
}

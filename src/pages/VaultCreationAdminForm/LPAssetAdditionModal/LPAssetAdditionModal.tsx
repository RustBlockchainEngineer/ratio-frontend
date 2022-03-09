import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Modal, Row } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import AdminFormInput from '../../../components/AdminFormInput';
import { API_ENDPOINT } from '../../../constants';
import { useAuthContextProvider } from '../../../contexts/authAPI';
import { Token } from '../../../types/VaultTypes';

export interface LPAssetCreationData {
  token_address_id: string;
  token_pool_size: number;
}

export default function LPAssetAdditionModal({
  show,
  close,
  onAdd,
}: {
  show: boolean;
  close: () => void;
  onAdd: (newAsset: LPAssetCreationData) => void;
}) {
  const [validated, setValidated] = useState(false);
  const defaultValues: LPAssetCreationData = {
    token_pool_size: 0,
    token_address_id: '',
  };
  const [data, setData] = useState<LPAssetCreationData>(defaultValues);
  const { accessToken } = useAuthContextProvider();
  const fetchTokens = useCallback(async (): Promise<Token[]> => {
    const response = await fetch(`${API_ENDPOINT}/tokens`, {
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
  }, []);
  const [tokens, setTokens] = useState<Token[]>([]);
  useEffect(() => {
    let active = true;
    load();
    return () => {
      active = false;
    };
    async function load() {
      const res = await fetchTokens();
      if (!active) {
        return;
      }
      setTokens(res);
    }
  }, [fetchTokens]);
  const handleChange = (event: any) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? 0,
    }));
  };
  const handleSubmit = async (evt: any) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    setValidated(true);
    onAdd(data);
    close();
  };
  return (
    <Modal
      show={show}
      onHide={() => close()}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="dashboardModal__modal"
    >
      <Modal.Header>
        <div className="dashboardModal__modal__header">
          <IoMdClose size={32} className="dashboardModal__modal__header-close" onClick={() => close()} />
          <h5>Add token to the vault</h5>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="dashboardModal__modal__body">
          <Form onSubmit={handleSubmit}>
            <Row>
              <AdminFormInput
                handleChange={handleChange}
                label="Token"
                as="select"
                name="token_address_id"
                value={data?.token_address_id}
                md="12"
              >
                <option key="" disabled value="">
                  -Select option-
                </option>
                {tokens?.map((item) => (
                  <option key={item.address_id} value={item.address_id}>
                    {item.symbol}
                  </option>
                ))}
              </AdminFormInput>
            </Row>
            <Button className="button--blue bottomBtn" type="submit">
              Add
            </Button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

import { useState } from 'react';
import { Button, Form, Modal, Row } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import AdminFormInput from '../../../components/AdminFormInput';
import { FormControlElement } from '../../../components/AdminFormInput/AdminFormInput';
import { TokenSource } from '../TokensAdminForm';

interface PriceSourceAdditionModalProps {
  show: boolean;
  sources: string[];
  close: () => void;
  onAdd: (result: TokenSource) => void;
}

export default function PriceSourceAdditionModal({ show, sources, close, onAdd }: PriceSourceAdditionModalProps) {
  const [data, setData] = useState<TokenSource>({
    source: '',
    token_id: '',
  });
  const handleChange = (event: React.ChangeEvent<FormControlElement>) => {
    setData((values) => ({
      ...values,
      [event.target.name]: event.target.value ?? '',
    }));
  };
  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    onAdd(data);
    close();
  };
  return (
    <Modal
      size="lg"
      show={show}
      onHide={() => close()}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="dashboardModal__modal"
    >
      <Modal.Header>
        <div className="dashboardModal__modal__header">
          <IoMdClose size={32} className="dashboardModal__modal__header-close" onClick={() => close()} />
          <h5>Add a price source to the token</h5>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="dashboardModal__modal__body">
          <Form onSubmit={handleSubmit}>
            <Row>
              <AdminFormInput
                handleChange={handleChange}
                label="Source"
                as="select"
                name="source"
                value={data.source}
                md="12"
              >
                <option key="" disabled value="">
                  -Select option-
                </option>
                {sources?.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </AdminFormInput>
              <AdminFormInput
                handleChange={handleChange}
                label="Source Token id"
                name="token_id"
                value={data.token_id}
                placeholder="Enter the id to use when fetching this token's price from the source"
                md="12"
              />
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

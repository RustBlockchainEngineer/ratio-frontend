import { useState } from 'react';
import { Button, Form, Modal, Row } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import AdminFormInput from '../../../components/AdminFormInput';
import { Platform } from '../../../types/VaultTypes';

export default function PlatformAdditionModal({
  show,
  platforms,
  close,
  onAdd,
}: {
  show: boolean;
  platforms: Platform[];
  close: () => void;
  onAdd: (platformId: string) => void;
}) {
  const [data, setData] = useState<string>('');
  const handleChange = (event: any) => {
    setData(event.target.value);
  };
  const handleSubmit = async (evt: any) => {
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
          <h5>Link platform to the token</h5>
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
                value={data}
                md="12"
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
            </Row>
            <Button className="button--blue bottomBtn" type="submit">
              Link
            </Button>
          </Form>
        </div>
      </Modal.Body>
    </Modal>
  );
}

import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { changeSuperOwner, getCurrentEmergencyState, toggleEmergencyState } from '../../utils/admin-contract-calls';
import { getCurrentSuperOwner } from '../../utils/ratio-lending';
import AdminFormLayout from '../AdminFormLayout';

export default function AdminTasksForm() {
  const [superOwner, setSuperOwner] = useState<string>();
  const [superOwnerChanged, setSuperOwnerChanged] = useState(false);
  const [validated, setValidated] = useState(false);
  const [emergencyState, setEmergencyState] = useState('Unknown');
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;

  useEffect(() => {
    let active = true;
    getCurrentSuperOwner(connection, wallet).then((result: PublicKey) => {
      if (active && result) {
        setSuperOwner(result.toBase58());
      }
    });
    return () => {
      active = false;
    };
  }, [connection, wallet]);

  useEffect(() => {
    let active = true;
    getCurrentEmergencyState(connection, wallet).then((result: string) => {
      if (active && result) {
        setEmergencyState(result);
      }
    });
    return () => {
      active = false;
    };
  }, [connection, wallet]);

  const handleSuperOwnerInputChange = (event: any) => {
    setSuperOwner(event.target.value);
    setSuperOwnerChanged(true);
  };

  const handleToggleEmergencyStateClick = async (evt: any) => {
    evt.preventDefault();
    await toggleEmergencyState(connection, wallet);
  };

  const handleChangeSuperOwnerSubmit = async (evt: any) => {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    if (!superOwnerChanged || !superOwner) {
      return;
    }
    setValidated(true);
    try {
      await changeSuperOwner(connection, wallet, new PublicKey(superOwner));
      toast.info('Super owner changed successfully');
    } catch (error: unknown) {
      toast.error('There was an error when changing the super owner');
      throw error;
    }
    return;
  };
  return (
    <AdminFormLayout>
      <h5 className="mt-3">Current admin actions:</h5>
      <Form validated={validated} onSubmit={handleChangeSuperOwnerSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="8" controlId="superOwner">
            <Form.Label>Super owner</Form.Label>
            <InputGroup hasValidation>
              <Form.Control name="superOwner" required value={superOwner} onChange={handleSuperOwnerInputChange} />
              <Button disabled={!superOwnerChanged} variant="primary" type="submit">
                Change super owner
              </Button>
            </InputGroup>
          </Form.Group>
        </Row>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column md={3} sm={4}>
            Current emergency state: <span className="font-italic">{emergencyState}</span>
          </Form.Label>
          <Col md="auto" sm={4}>
            <Button variant="primary" type="button" onClick={handleToggleEmergencyStateClick}>
              Toggle emergency state
            </Button>
          </Col>
        </Form.Group>
      </Form>
    </AdminFormLayout>
  );
}

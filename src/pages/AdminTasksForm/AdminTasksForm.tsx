import { PublicKey } from '@solana/web3.js';
import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { EmergencyState } from '../../types/admin-types';
import {
  changeSuperOwner,
  getCurrentEmergencyState,
  changeTreasury,
  setEmergencyState as setEmergencyStateOnContract,
  getCurrentTreasuryWallet,
} from '../../utils/admin-contract-calls';
import { getCurrentSuperOwner } from '../../utils/ratio-lending';
import AdminFormLayout from '../AdminFormLayout';

export default function AdminTasksForm() {
  const [superOwner, setSuperOwner] = useState<string>('');
  const [originalSuperOwner, setOriginalSuperOwner] = useState<string>('');
  const [treasuryWallet, setTreasuryWallet] = useState<string>('');
  const [originalTreasuryWallet, setOriginalTreasuryWallet] = useState<string>('');
  const [validated, setValidated] = useState(false);
  const [treasuryWalletFormValidated, setTreasuryWalletFormValidated] = useState(false);
  const [currEmerState, setCurrEmerState] = useState(EmergencyState.UNKNOWN);
  const [emerStateChanging, setEmerStateChanging] = useState(false);
  const [emerStateVersion, setEmerStateVersion] = useState(1);
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;

  const superOwnerChanged = useMemo(() => originalSuperOwner !== superOwner, [originalSuperOwner, superOwner]);
  const treasuryWalletChanged = useMemo(
    () => originalTreasuryWallet !== treasuryWallet,
    [originalTreasuryWallet, treasuryWallet]
  );

  useEffect(() => {
    let active = true;
    getCurrentSuperOwner(connection, wallet).then((result: PublicKey) => {
      if (active && result) {
        const resultAddr = result.toBase58();
        setSuperOwner(resultAddr);
        setOriginalSuperOwner(resultAddr);
      }
    });
    return () => {
      active = false;
    };
  }, [connection, wallet]);

  useEffect(() => {
    let active = true;
    getCurrentTreasuryWallet(connection, wallet).then((result: PublicKey) => {
      if (active && result) {
        const resultAddr = result.toBase58();
        setTreasuryWallet(resultAddr);
        setOriginalTreasuryWallet(resultAddr);
      }
    });
    return () => {
      active = false;
    };
  }, [connection, wallet]);

  useEffect(() => {
    let active = true;
    getCurrentEmergencyState(connection, wallet).then((result: EmergencyState) => {
      if (active && result !== undefined) {
        setCurrEmerState(result);
      }
    });
    return () => {
      active = false;
    };
  }, [connection, wallet, emerStateVersion]);

  const handleSuperOwnerInputChange = (event: any) => {
    setSuperOwner(event.target.value);
  };

  const handleTreasuryWalletInputChange = (event: any) => {
    setTreasuryWallet(event.target.value);
  };

  const handleToggleEmergencyStateClick = async (evt: any) => {
    evt.preventDefault();
    if (wallet?.publicKey?.toBase58() !== originalSuperOwner) {
      toast.error('Connected user is not the contract authority');
      return;
    }
    try {
      setEmerStateChanging(true);
      await setEmergencyStateOnContract(
        connection,
        wallet,
        currEmerState === EmergencyState.RUNNING ? EmergencyState.PAUSED : EmergencyState.RUNNING
      );
      setEmerStateVersion(emerStateVersion + 1);
      setEmerStateChanging(false);
      toast.info('Emergency state changed successfully');
    } catch (error: unknown) {
      toast.error('There was an error when toggling the emergency state');
      throw error;
    }
  };

  const handleChangeSuperOwnerSubmit = async (evt: any) => {
    evt.preventDefault();
    if (wallet?.publicKey?.toBase58() !== originalSuperOwner) {
      toast.error('Connected user is not the contract authority');
      return;
    }
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
      setOriginalSuperOwner(superOwner);
      toast.info('Super owner changed successfully');
    } catch (error: unknown) {
      toast.error('There was an error when changing the super owner');
      throw error;
    }
    return;
  };

  const handleChangeTreasuryWalletSubmit = async (evt: any) => {
    evt.preventDefault();
    if (wallet?.publicKey?.toBase58() !== originalSuperOwner) {
      toast.error('Connected user is not the contract authority');
      return;
    }
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    if (!treasuryWalletChanged || !treasuryWallet) {
      return;
    }
    setTreasuryWalletFormValidated(true);
    try {
      await changeTreasury(connection, wallet, new PublicKey(treasuryWallet));
      toast.info('Treasury wallet changed successfully');
    } catch (error: unknown) {
      toast.error('There was an error when changing the treasury wallet');
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
              {superOwnerChanged && (
                <Button disabled={!superOwnerChanged} variant="primary" type="submit">
                  Change super owner
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Row>
      </Form>
      <Form validated={treasuryWalletFormValidated} onSubmit={handleChangeTreasuryWalletSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="8" controlId="treasuryWallet">
            <Form.Label>Treasury wallet</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                name="treasuryWallet"
                required
                value={treasuryWallet}
                onChange={handleTreasuryWalletInputChange}
              />
              {treasuryWalletChanged && (
                <Button disabled={!treasuryWalletChanged} variant="primary" type="submit">
                  Change treasury wallet
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Row>
      </Form>
      <Form.Group as={Row} className="mb-3">
        <Form.Label column md={3} sm={4}>
          Current emergency state: <span className="font-italic">{EmergencyState[currEmerState]}</span>
        </Form.Label>
        <Col md="auto" sm={4}>
          <Button
            disabled={emerStateChanging}
            variant="primary"
            type="button"
            onClick={handleToggleEmergencyStateClick}
          >
            {emerStateChanging ? <LoadingSpinner className="spinner-border-sm text-info" /> : 'Toggle emergency state'}
          </Button>
        </Col>
      </Form.Group>
    </AdminFormLayout>
  );
}

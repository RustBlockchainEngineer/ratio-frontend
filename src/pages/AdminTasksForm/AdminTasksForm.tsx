import { PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { useConnection } from '../../contexts/connection';
import { useRFStateInfo } from '../../contexts/state';
import { useWallet } from '../../contexts/wallet';
import { EmergencyState } from '../../types/admin-types';
import {
  changeFundingWallet,
  changeRatioMint,
  changeSuperOwner,
  changeTreasury,
  setEmergencyState as setEmergencyStateOnContract,
  changeOracleReporter,
} from '../../utils/ratio-lending-admin';
import AdminFormLayout from '../AdminFormLayout';

export default function AdminTasksForm() {
  const globalState = useRFStateInfo();
  const originalSuperOwner = globalState ? globalState.authority.toString() : '';
  const [superOwner, setSuperOwner] = useState<string>(originalSuperOwner);

  const originalTreasuryWallet = globalState ? globalState.treasury.toString() : '';
  const [treasuryWallet, setTreasuryWallet] = useState<string>(originalTreasuryWallet);

  const [validated, setValidated] = useState(false);
  const [treasuryWalletFormValidated, setTreasuryWalletFormValidated] = useState(false);
  const currEmerState = globalState ? globalState.paused : 0;
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

  const originalfundingWallet = globalState
    ? globalState.fundingWallet
      ? globalState.fundingWallet.toString()
      : ''
    : '';
  const [fundingWallet, setfundingWallet] = useState<string>(originalfundingWallet);
  const [fundingWalletFormValidated, setfundingWalletFormValidated] = useState(false);
  const fundingWalletChanged = useMemo(
    () => originalfundingWallet !== fundingWallet,
    [originalfundingWallet, fundingWallet]
  );
  const originalratioMint = globalState ? (globalState.ratioMint ? globalState.ratioMint.toString() : '') : '';
  const [ratioMint, setRatioMint] = useState<string>(originalratioMint);
  const [ratioMintFormValidated, setratioMintFormValidated] = useState(false);
  const ratioMintChanged = useMemo(() => originalratioMint !== ratioMint, [originalratioMint, ratioMint]);

  const [oracleReporterFormValidated, setOracleReporterFormValidated] = useState(false);
  const originalOracleReporter = globalState
    ? globalState.oracleReporter
      ? globalState.oracleReporter.toString()
      : ''
    : '';
  const [oracleReporter, setOracleReporter] = useState<string>(originalOracleReporter);
  const oracleReporterChanged = useMemo(
    () => originalOracleReporter !== oracleReporter,
    [originalOracleReporter, oracleReporter]
  );

  const handleSuperOwnerInputChange = (event: any) => {
    setSuperOwner(event.target.value);
  };
  const handleTreasuryWalletInputChange = (event: any) => {
    setTreasuryWallet(event.target.value);
  };
  const handleRatioMintInputChange = (event: any) => {
    setRatioMint(event.target.value);
  };
  const handlefundingWalletInputChange = (event: any) => {
    setfundingWallet(event.target.value);
  };
  const handleOracleReporterInputChange = (event: any) => {
    setOracleReporter(event.target.value);
  };

  const handleChangefundingWalletSubmit = async (evt: any) => {
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
    if (!fundingWalletChanged || !fundingWallet) {
      return;
    }
    setfundingWalletFormValidated(true);
    try {
      await changeFundingWallet(connection, wallet, new PublicKey(fundingWallet));
      toast.info('Funding wallet has been set successfully');
    } catch (error: unknown) {
      toast.error('There was an error when setting funding wallet');
      throw error;
    }
    return;
  };
  const handleChangeRatioMintSubmit = async (evt: any) => {
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
    if (!ratioMintChanged || !ratioMint) {
      return;
    }
    setratioMintFormValidated(true);
    try {
      await changeRatioMint(connection, wallet, new PublicKey(ratioMint));
      toast.info('Ratio Mint has been set successfully');
    } catch (error: unknown) {
      toast.error('There was an error when setting funding wallet');
      throw error;
    }
    return;
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

  const handleChangeOracleReporterSubmit = async (evt: any) => {
    evt.preventDefault();
    /*if (wallet?.publicKey?.toBase58() !== originalSuperOwner) {
      toast.error('Connected user is not the contract authority');
      return;
    }*/
    const form = evt.currentTarget;
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      return;
    }
    if (!oracleReporterChanged || !oracleReporter) {
      return;
    }
    setOracleReporterFormValidated(true);
    try {
      await changeOracleReporter(connection, wallet, new PublicKey(oracleReporter));
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
      <Form validated={oracleReporterFormValidated} onSubmit={handleChangeOracleReporterSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="8" controlId="oracleReporter">
            <Form.Label>Oracle Reporter</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                name="oracleReporter"
                required
                value={oracleReporter}
                onChange={handleOracleReporterInputChange}
              />
              {oracleReporterChanged && (
                <Button disabled={!oracleReporterChanged} variant="primary" type="submit">
                  Change Oracle Reporter
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Row>
      </Form>
      <Form validated={ratioMintFormValidated} onSubmit={handleChangeRatioMintSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="8" controlId="ratioMint">
            <Form.Label>Ratio Mint</Form.Label>
            <InputGroup hasValidation>
              <Form.Control name="ratioMint" required value={ratioMint} onChange={handleRatioMintInputChange} />
              {ratioMintChanged && (
                <Button disabled={!ratioMintChanged} variant="primary" type="submit">
                  Set Ratio Mint
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Row>
      </Form>
      <Form validated={fundingWalletFormValidated} onSubmit={handleChangefundingWalletSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="8" controlId="fundingWallet">
            <Form.Label>Funding Wallet</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                name="fundingWallet"
                required
                value={fundingWallet}
                onChange={handlefundingWalletInputChange}
              />
              {fundingWalletChanged && (
                <Button disabled={!fundingWalletChanged} variant="primary" type="submit">
                  Set Funding Wallet
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

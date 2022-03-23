import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useConnection } from '../../contexts/connection';
import { useWallet } from '../../contexts/wallet';
import { LPEditionData } from '../../types/VaultTypes';
import { createGlobalState } from '../../utils/admin-contract-calls';
import { isGlobalStateCreated } from '../../utils/ratio-lending';
import AdminFormLayout from '../AdminFormLayout';
import VaultEditionForm from './VaultEditionForm';
import VaultsTable from './VaultsTable';

export default function VaultCreationAdminForm() {
  const [globalStateCreated, setGlobalStateCreated] = useState(false);
  const connection = useConnection();
  const gWallet = useWallet();
  const wallet = gWallet.wallet;
  const emptyVault: LPEditionData = {
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
      {globalStateCreated && <VaultEditionForm values={emptyVault} />}
      <VaultsTable />
    </AdminFormLayout>
  );
}

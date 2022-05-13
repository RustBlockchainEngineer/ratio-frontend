import { Button } from 'react-bootstrap';
import { useConnection } from '../../contexts/connection';
import { useRFStateInfo } from '../../contexts/state';
import { useWallet } from '../../contexts/wallet';
import { LPEditionData } from '../../types/VaultTypes';
import { createGlobalState } from '../../utils/admin-contract-calls';
import AdminFormLayout from '../AdminFormLayout';
import VaultEditionForm from './VaultEditionForm';
import VaultsTable from './VaultsTable';

export default function VaultCreationAdminForm() {
  const globalState = useRFStateInfo();
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
    risk_rating: null,
    lpasset: [],
    reward_mint: '',
    token_mint_a: '',
    token_mint_b: '',
    token_reserve_a: '',
    token_reserve_b: '',
  };
  const onCreateProgramState = async () => {
    await createGlobalState(connection, wallet);
  };

  return (
    <AdminFormLayout>
      <h5 className="mt-3">Add new vault:</h5>
      {!globalState ? (
        <div className="global-state-not-found-container">
          <p>Global state was not found, it needs to be created in order to create vaults.</p>
          <Button className="button--fill mt-4" onClick={onCreateProgramState} disabled={globalState}>
            Create Program State
          </Button>
        </div>
      ) : (
        <VaultEditionForm values={emptyVault} />
      )}
      <VaultsTable />
    </AdminFormLayout>
  );
}

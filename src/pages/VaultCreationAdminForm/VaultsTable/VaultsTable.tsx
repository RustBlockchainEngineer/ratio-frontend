import { useState } from 'react';
import { Button, Dropdown, Table } from 'react-bootstrap';
import { IoHammerOutline, IoMenuOutline, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../atoms/LoadingSpinner';
import { API_ENDPOINT } from '../../../constants';
import { useAuthContextProvider } from '../../../contexts/authAPI';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { FetchingStatus } from '../../../types/fetching-types';
import { LPair } from '../../../types/VaultTypes';
import VaultEditionModal from '../VaultEditionModal';

export default function VaultsTable() {
  const { status, error, vaults, forceUpdate } = useVaultsContextProvider();
  const [disabledRemoves] = useState(() => new Map<string, boolean>());
  const { accessToken } = useAuthContextProvider();
  const [disableEdit, setDisableEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Maybe<LPair>>(null);
  const handleRemoveVault = async (address_id: string) => {
    disabledRemoves.set(address_id, true);
    if (await confirm('Are you sure?')) {
      try {
        const response = await fetch(`${API_ENDPOINT}/lpairs/${address_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': accessToken,
          },
          method: 'DELETE',
        });
        if (response.ok) {
          toast.info('Vault deleted successfully');
          forceUpdate();
        } else {
          toast.error("Vault wasn't removed. An error has occured");
        }
      } catch (error) {
        toast.error("Vault wasn't removed. A network problem has occured");
      }
    }
    disabledRemoves.set(address_id, false);
  };
  const handleEditVault = async (item: LPair) => {
    setDisableEdit(true);
    setShowEditModal(true);
    setCurrentEdit(item);
  };
  return (
    <div>
      <h5 className="mt-3">Current vaults:</h5>
      {status === FetchingStatus.Error && toast.error(error)}
      {(status === FetchingStatus.Loading || status === FetchingStatus.NotAsked) && (
        <LoadingSpinner className="spinner-border-lg text-info" />
      )}
      {status === FetchingStatus.Finish && (
        <Table className="mt-3" striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Vault address</th>
              <th>LP mint address</th>
              <th>Name</th>
              <th>Created on</th>
              <th>Platform</th>
              <th>Risk rating</th>
              <th>
                <IoMenuOutline size={20} />
              </th>
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
                <td>
                  <Dropdown>
                    <Dropdown.Toggle id="dropdown-basic">
                      <IoMenuOutline size={20} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item href={`#${item.address_id}/edit`}>
                        <Button variant="primary" disabled={disableEdit} onClick={() => handleEditVault(item)}>
                          <IoHammerOutline size={20} /> Edit
                        </Button>
                      </Dropdown.Item>
                      <Dropdown.Item href={`#${item.address_id}/remove`}>
                        <Button
                          variant="primary"
                          disabled={disabledRemoves.get(item.address_id) ?? false}
                          onClick={() => handleRemoveVault(item.address_id)}
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
      )}
      <VaultEditionModal
        show={showEditModal}
        vault={currentEdit}
        close={() => {
          setDisableEdit(false);
          setShowEditModal(false);
          setCurrentEdit(null);
        }}
      />
    </div>
  );
}

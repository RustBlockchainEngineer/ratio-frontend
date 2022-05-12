import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { Button, Dropdown, Table } from 'react-bootstrap';
import { IoHammerOutline, IoMenuOutline, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../atoms/LoadingSpinner';
import { API_ENDPOINT } from '../../../constants';
import { useAuthContextProvider } from '../../../contexts/authAPI';
import { useConnection } from '../../../contexts/connection';
import { useAllPoolInfo } from '../../../contexts/state';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { useWallet } from '../../../contexts/wallet';
import { FetchingStatus } from '../../../types/fetching-types';
import { LPair, LPEditionData } from '../../../types/VaultTypes';
import { getAllPools, setPoolPaused } from '../../../utils/admin-contract-calls';
import VaultEditionModal from '../VaultEditionModal';

export default function VaultsTable() {
  const { status, error, vaults, forceUpdate } = useVaultsContextProvider();
  const [disabledRemoves] = useState(() => new Map<string, boolean>());
  const [pausedStatuses, setPausedStatuses] = useState(() => new Map<string, boolean>());
  const [refreshPools, setRefreshPools] = useState(true);
  const { accessToken } = useAuthContextProvider();
  const [disableEdit, setDisableEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Maybe<LPEditionData>>(null);
  const poolInfos = useAllPoolInfo();
  const connection = useConnection();
  const wallet = useWallet();
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
          setRefreshPools(true);
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
    const onChainPoolInfo = poolInfos[item.address_id];
    const extendedInfo: any = { ...item };
    if (onChainPoolInfo) {
      extendedInfo.reward_mint = onChainPoolInfo.mintReward.toString();
      extendedInfo.token_mint_a = onChainPoolInfo.swapMintA.toString();
      extendedInfo.token_mint_b = onChainPoolInfo.swapMintB.toString();
      extendedInfo.token_reserve_a = onChainPoolInfo.swapTokenA.toString();
      extendedInfo.token_reserve_b = onChainPoolInfo.swapTokenB.toString();
    }
    setCurrentEdit(extendedInfo);
  };
  const setPoolPause = async (poolKey: string, value: number) => {
    try {
      await setPoolPaused(connection, wallet.wallet, new PublicKey(poolKey), value);
      toast.success('Successfully ' + (value === 0 ? 'Resumed' : 'Paused'));
      setRefreshPools(true);
    } catch (e) {
      console.log(e);
      toast.error('Pausing/Resuming pool is failed! ');
    }
  };
  useEffect(() => {
    if (refreshPools) {
      const statuses = new Map<string, boolean>();
      getAllPools(connection, wallet).then((allPools) => {
        allPools.forEach((pool) => {
          statuses.set(pool.publicKey.toBase58(), pool.account.isPaused > 0);
        });
        setPausedStatuses(statuses);
      });
      setRefreshPools(false);
    }
  }, [refreshPools]);
  return (
    <div>
      <h5 className="mt-3">Current vaults:</h5>
      {status === FetchingStatus.Error && toast.error(error)}
      {(status === FetchingStatus.Loading || status === FetchingStatus.NotAsked || !poolInfos) && (
        <LoadingSpinner className="spinner-border-lg text-info" />
      )}
      {status === FetchingStatus.Finish && poolInfos && (
        <Table className="mt-3" striped bordered hover size="sm">
          <thead>
            <tr>
              <th></th>
              <th>Pool address</th>
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
                <td>{poolInfos[item.address_id] && poolInfos[item.address_id].isPaused ? 'Paused' : ''}</td>
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
                      <Dropdown.Item href={`#${item.address_id}/edit`}>
                        <Button
                          variant="primary"
                          onClick={() =>
                            setPoolPause(item.vault_address_id, pausedStatuses.get(item.vault_address_id) ? 0 : 1)
                          }
                        >
                          <IoHammerOutline size={20} />
                          {pausedStatuses.get(item.vault_address_id) ? 'Resume' : 'Pause'}
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

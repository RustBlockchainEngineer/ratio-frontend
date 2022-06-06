import { useMemo, useState } from 'react';
import { Table } from 'react-bootstrap';
import Button from '../../Button';
import { useGetPoolManager } from '../../../hooks/useGetPoolManager';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { LPair } from '../../../types/VaultTypes';
import { toast } from 'react-toastify';
import { useAppendUserAction, useUserVaultInfo, useSubscribeTx } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';
import LoadingSpinner from '../../../atoms/LoadingSpinner';
import { HARVEST_ACTION } from '../../../utils/ratio-lending';

const TokensEarned = ({ data }: any) => {
  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mintAddress as string)), [vaults]);

  const connection = useConnection();
  const { wallet } = useWallet();

  const poolManager = useGetPoolManager(vault);

  const vaultState = useUserVaultInfo(data.mintAddress);

  const [isHarvesting, setIsHarvesting] = useState(false);

  const appendUserAction = useAppendUserAction();
  const subscribeTx = useSubscribeTx();

  const harvest = async () => {
    try {
      if (!poolManager || !poolManager?.harvestReward) {
        throw new Error('Pool manager factory not initialized');
      }

      console.log('Harvesting...');
      setIsHarvesting(true);
      const txHash = await poolManager?.harvestReward(connection, wallet, vault as LPair);
      subscribeTx(
        txHash,
        () => toast.info('Harvest Transaction Sent'),
        () => toast.success('Harvest Confirmed.'),
        () => toast.error('Harvest Transaction Failed')
      );
      appendUserAction(
        wallet.publicKey.toString(),
        data.mintAddress,
        data.realUserRewardMint,
        HARVEST_ACTION,
        0,
        txHash,
        0
      );
    } catch (err) {
      console.error(err);
      if (isWalletApproveError(err)) toast.warn('Wallet is not approved!');
      else toast.error('Transaction Error!');
    }
    setIsHarvesting(false);
  };

  return (
    <div className="tokensearned">
      <h4>Tokens Earned</h4>
      <Table striped hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rewards</th>
            <th>USD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="tokensearned__name">
              {/* {data.icon && <img src={data.icon} alt="icon" className="tokensearned__icon" />} */}
              <img src={data?.platform?.icon} alt="SBR" className="tokensearned__icon" />
              {poolManager?.getTokenName()}
            </td>
            <td className="align-middle">
              {vaultState ? vaultState.reward : 0} {poolManager?.getTokenName()}
            </td>
            <td className="align-middle">
              {!vaultState?.rewardUSD ? (
                <LoadingSpinner className="spinner-border-sm text-info" />
              ) : (
                `$  ${vaultState?.rewardUSD}`
              )}
            </td>
          </tr>
        </tbody>
      </Table>
      <div className="px-4">
        <Button className="button--blue generate btn-block" onClick={harvest} disabled={isHarvesting}>
          Harvest
        </Button>
      </div>
    </div>
  );
};

export default TokensEarned;

import { useMemo, useState } from 'react';
import { Table } from 'react-bootstrap';
import Button from '../../Button';
import { useGetPoolManager } from '../../../hooks/useGetPoolManager';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { LPair } from '../../../types/VaultTypes';
import { toast } from 'react-toastify';
import { useAppendUserAction, useUserVaultInfo, useSubscribeTx, useRFStateInfo } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';
import LoadingSpinner from '../../../atoms/LoadingSpinner';
import { harvestRatioReward, HARVEST_ACTION } from '../../../utils/ratio-lending';
import RatioIcon from '../../../assets/images/USDr.svg';

const TokensEarned = ({ data }: any) => {
  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mintAddress as string)), [vaults]);

  const connection = useConnection();
  const { wallet } = useWallet();

  const poolManager = useGetPoolManager(vault);

  const vaultState = useUserVaultInfo(data.mintAddress);

  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isHarvestingRatio, setIsHarvestingRatio] = useState(false);

  const appendUserAction = useAppendUserAction();
  const subscribeTx = useSubscribeTx();
  const globalState = useRFStateInfo();

  const harvest_reward_fee = globalState.harvestFeeNumer.toNumber() / globalState.feeDeno.toNumber();

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
        vaultState ? vaultState.reward : 0,
        txHash,
        0,
        0,
        harvest_reward_fee
      );
    } catch (err) {
      console.error(err);
      if (isWalletApproveError(err)) toast.warn('Wallet is not approved!');
      else toast.error('Transaction Error!');
    }
    setIsHarvesting(false);
  };

  const harvestRatio = async () => {
    try {
      console.log('Harvesting Ratio...');
      setIsHarvestingRatio(true);
      const txHash = await harvestRatioReward(connection, wallet, vault.address_id);
      subscribeTx(
        txHash,
        () => toast.info('Harvest Ratio Transaction Sent'),
        () => toast.success('Harvest Ratio Confirmed.'),
        () => toast.error('Harvest Ratio Transaction Failed')
      );
      console.log('Amount to Harvest ' + vaultState.ratioReward);
      appendUserAction(
        wallet.publicKey.toString(),
        data.mintAddress,
        'ratioMVg27rSZbSvBopUvsdrGUzeALUfFma61mpxc8J',
        HARVEST_ACTION,
        vaultState ? vaultState.ratioReward : 0,
        txHash,
        0,
        0,
        0
      );
    } catch (err) {
      console.error(err);
      if (isWalletApproveError(err)) toast.warn('Wallet is not approved!');
      else toast.error('Transaction Error!');
    }
    setIsHarvestingRatio(false);
  };

  const isSinglePool = () => {
    return data?.platform?.symbol === 'Saber';
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {isSinglePool() && (
            <tr>
              <td>
                {/* {data.icon && <img src={data.icon} alt="icon" className="tokensearned__icon" />} */}
                <div className="tokensearned__name">
                  <img src={data?.platform?.icon} alt="SBR" className="tokensearned__icon" />
                  {/* <span>{poolManager?.getTokenName()}</span> */}
                </div>
              </td>
              <td className="align-middle">{vaultState ? vaultState.reward : 0}</td>
              <td className="align-middle">
                {!vaultState?.rewardUSD ? (
                  <LoadingSpinner className="spinner-border-sm text-info" />
                ) : (
                  `$  ${vaultState?.rewardUSD}`
                )}
              </td>
              <td>
                <Button
                  className="button--blue tokensearned__harvestBtn btn-block"
                  onClick={harvest}
                  disabled={isHarvesting}
                >
                  Harvest
                </Button>
              </td>
            </tr>
          )}
          <tr>
            <td className="tokensearned__name" style={{ gap: 12 }}>
              <img src={RatioIcon} alt="RatioIcon" className="tokensearned__icon" />
            </td>
            <td className="align-middle">{vaultState ? vaultState.ratioReward : 0} </td>
            <td className="align-middle">
              {!vaultState?.ratioRewardUSD ? (
                <LoadingSpinner className="spinner-border-sm text-info" />
              ) : (
                `$  ${vaultState?.ratioRewardUSD}`
              )}
            </td>
            <td>
              <Button
                className="button--blue tokensearned__harvestBtn btn-block px-2"
                onClick={harvestRatio}
                disabled={isHarvestingRatio}
              >
                Harvest
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
      {/* <div className="px-4">
        <Button className="button--blue generate btn-block" onClick={harvest} disabled={isHarvesting}>
          Harvest
        </Button>
      </div> */}
    </div>
  );
};

export default TokensEarned;

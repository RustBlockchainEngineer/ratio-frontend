import { useEffect, useMemo, useState } from 'react';
import { Table } from 'react-bootstrap';
import Button from '../../Button';
import { useGetPoolInfoProvider } from '../../../hooks/useGetPoolInfoProvider';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { LPair } from '../../../types/VaultTypes';
import { useUpdateHistory } from '../../../contexts/auth';
import { toast } from 'react-toastify';

const TokensEarned = ({ data }: any) => {
  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mintAddress as string)), [vaults]);

  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const { updateHistoryFlag, setUpdateHistoryFlag } = useUpdateHistory();
  const poolInfoProviderFactory = useGetPoolInfoProvider(vault);

  const [rewards, setRewards] = useState(0);
  const updateRewards = async () => {
    if (poolInfoProviderFactory && wallet && wallet.publicKey) {
      console.log('Getting reward');

      const reward = await poolInfoProviderFactory?.getRewards(connection, wallet, vault as LPair);

      console.log('Got reward', reward);

      setRewards(reward as number);
    }
  };

  // const timer = setInterval(updateRewards, REFRESH_TIMER);

  useEffect(() => {
    updateRewards();

    return () => {
      setRewards(0);
    };
  }, [updateHistoryFlag, connected, vault, poolInfoProviderFactory]);

  const harvest = () => {
    console.log('harvesting');
    poolInfoProviderFactory
      ?.harvestReward(connection, wallet, vault as LPair)
      .then(() => {
        setUpdateHistoryFlag(true);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        toast('Successfully Harvested!');
      });
  };

  return (
    <div className="tokensearned">
      <h4>Tokens Earned</h4>
      <Table striped hover>
        <thead>
          <tr>
            <th className="w-75">Name</th>
            <th className="w-25">Rewards</th>
            <th className="text-right">USD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="tokensearned__name">
              {data.icon && <img src={data.icon} alt="icon" className="tokensearned__icon" />}
              {data.tokenName === 'USDC-USDR' ? 'USDC-USDr' : data.tokenName}
            </td>
            <td className="align-middle">{rewards}</td>
            <td className="text-right align-middle">${rewards * 100}</td>
          </tr>
        </tbody>
      </Table>
      <div className="px-4">
        <Button className="button--blue generate btn-block" onClick={harvest}>
          Harvest
        </Button>
      </div>
    </div>
  );
};

export default TokensEarned;

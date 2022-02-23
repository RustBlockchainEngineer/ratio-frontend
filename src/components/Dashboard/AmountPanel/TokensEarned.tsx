import React, { useEffect, useMemo, useState } from 'react';

import { Table } from 'react-bootstrap';
import Button from '../../Button';
import RAY from '../../../assets/images/RAY.svg';
import SOL from '../../../assets/images/SOL.svg';
import { useGetPoolInfoProvider } from '../../../hooks/useGetPoolInfoProvider';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { LPair } from '../../../types/VaultTypes';
import { getUserHistory, HARVEST_ACTION } from '../../../utils/ratio-lending';
import { PublicKey } from '@solana/web3.js';
import { useAccountByMint } from '../../../contexts/accounts';
import { SABER_REWARD_MINT } from '../../../utils/saber/constants';
import { useUpdateHistory } from '../../../contexts/auth';
import { toast } from 'react-toastify';
import { REFRESH_TIMER } from '../../../constants';

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
    <div>
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
            <td className="name">
              <img src={RAY} alt="RAY" />
              <img src={SOL} alt="RAY" className="lastToken" />
              RAY-SOL-LP
            </td>
            <td>{rewards}</td>
            <td className="text-right">${rewards * 100}</td>
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

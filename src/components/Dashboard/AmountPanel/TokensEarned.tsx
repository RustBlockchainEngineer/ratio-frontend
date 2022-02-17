import React, { useMemo } from 'react';

import { Table } from 'react-bootstrap';
import Button from '../../Button';
import RAY from '../../../assets/images/RAY.svg';
import SOL from '../../../assets/images/SOL.svg';
import { useGetPoolInfoProvider } from '../../../hooks/useGetPoolInfoProvider';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { LPair } from '../../../types/VaultTypes';

const TokensEarned = ({ data }: any) => {
  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mintAddress as string)), [vaults]);

  const connection = useConnection();
  const { wallet } = useWallet();

  const poolInfoProviderFactory = useGetPoolInfoProvider(vault);

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
            <td>500</td>
            <td className="text-right">$1,200</td>
          </tr>
          <tr>
            <td className="name">
              <img src={RAY} alt="RAY" />
              <img src={SOL} alt="RAY" className="lastToken" />
              RAY-SOL-LP
            </td>
            <td>500</td>
            <td className="text-right">$1,200</td>
          </tr>
          <tr>
            <td className="name">
              <img src={RAY} alt="RAY" />
              <img src={SOL} alt="RAY" className="lastToken" />
              RAY-SOL-LP
            </td>
            <td>500</td>
            <td className="text-right">$1,200</td>
          </tr>
        </tbody>
      </Table>
      <div className="px-4">
        <Button
          className="button--blue generate btn-block"
          onClick={() => {
            poolInfoProviderFactory?.harvestReward(connection, wallet, vault as LPair);
          }}
        >
          Harvest
        </Button>
      </div>
    </div>
  );
};

export default TokensEarned;

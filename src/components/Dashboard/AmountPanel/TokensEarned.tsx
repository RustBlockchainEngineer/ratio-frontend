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
import { SBR_PRICE, PRICE_DECIMAL } from '../../../constants/constants';
import { UPDATE_REWARD_STATE, useUpdateRFStates, useUserInfo } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';

const TokensEarned = ({ data }: any) => {
  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mintAddress as string)), [vaults]);

  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const updateRFStates = useUpdateRFStates();
  const poolInfoProviderFactory = useGetPoolInfoProvider(vault);

  const userState = useUserInfo(data.mintAddress);

  const harvest = () => {
    console.log('harvesting');
    poolInfoProviderFactory
      ?.harvestReward(connection, wallet, vault as LPair)
      .then(() => {
        updateRFStates(UPDATE_REWARD_STATE, data.mintAddress);
        toast('Successfully Harvested!');
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast('Wallet is not approved!');
        else toast('Transaction Error!');
      })
      .finally(() => {});
  };

  const getTokenNameByPlatform = (name: string) => {
    let tokenName;
    switch (name) {
      case 'SABER':
        tokenName = 'SBR';
        break;

      default:
        tokenName = 'SBR';
        break;
    }
    return tokenName;
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
              {/* {data.icon && <img src={data.icon} alt="icon" className="tokensearned__icon" />} */}
              <img src={data?.platform?.icon} alt="SBR" className="tokensearned__icon" />
              {getTokenNameByPlatform(data?.platform?.name)}
            </td>
            <td className="align-middle">
              {userState?.reward?.toFixed(PRICE_DECIMAL)} {getTokenNameByPlatform(data?.platform?.name)}
            </td>
            <td className="text-right align-middle">${(userState?.reward * SBR_PRICE)?.toFixed(PRICE_DECIMAL)}</td>
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

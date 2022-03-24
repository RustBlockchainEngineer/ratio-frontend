import { useMemo } from 'react';
import { Table } from 'react-bootstrap';
import Button from '../../Button';
import { useGetPoolManager } from '../../../hooks/useGetPoolManager';
import { useVaultsContextProvider } from '../../../contexts/vaults';
import { useConnection } from '../../../contexts/connection';
import { useWallet } from '../../../contexts/wallet';
import { LPair } from '../../../types/VaultTypes';
import { toast } from 'react-toastify';
import { PRICE_DECIMAL } from '../../../constants/constants';
import { UPDATE_REWARD_STATE, useUpdateRFStates, useUserInfo } from '../../../contexts/state';
import { isWalletApproveError } from '../../../utils/utils';
import { useFetchSaberPrice } from '../../../hooks/useCoinGeckoPrices';
import { FetchingStatus } from '../../../types/fetching-types';
import LoadingSpinner from '../../../atoms/LoadingSpinner';

const TokensEarned = ({ data }: any) => {
  const { vaults } = useVaultsContextProvider();
  const vault = useMemo(() => vaults.find((vault) => vault.address_id === (data.mintAddress as string)), [vaults]);

  const connection = useConnection();
  const { wallet } = useWallet();
  const updateRFStates = useUpdateRFStates();
  const PoolManagerFactory = useGetPoolManager(vault);

  const userState = useUserInfo(data.mintAddress);
  const { saberPrice, status: saberPriceStatus, error: saberPriceError } = useFetchSaberPrice();

  const harvest = () => {
    console.log('harvesting');
    PoolManagerFactory?.harvestReward(connection, wallet, vault as LPair)
      .then(() => {
        updateRFStates(UPDATE_REWARD_STATE, data.mintAddress);
      })
      .catch((e) => {
        console.log(e);
        if (isWalletApproveError(e)) toast.warn('Wallet is not approved!');
        else toast.error('Transaction Error!');
      })
      .finally(() => {
        toast.success('Successfully Harvested!');
      });
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
              {getTokenNameByPlatform(data?.platform?.name)}
            </td>
            <td className="align-middle">
              {userState?.reward} {getTokenNameByPlatform(data?.platform?.name)}
            </td>
            <td className="text-right align-middle">
              {saberPriceStatus === FetchingStatus.Loading && (
                <LoadingSpinner className="spinner-border-sm text-info" />
              )}
              {saberPriceStatus === FetchingStatus.Error &&
                toast.error('There was an error when fetching the saber pricehistory') &&
                console.error(saberPriceError)}
              {saberPriceStatus === FetchingStatus.Finish &&
                saberPrice &&
                `$  ${(userState?.reward * saberPrice)?.toFixed(PRICE_DECIMAL)}`}
            </td>
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

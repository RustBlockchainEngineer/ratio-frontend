import { useQuery } from '@apollo/react-hooks';
import { queryGetRewardsForWalletWithPaging } from '../queries/rewards';

export enum RewardStatus {
  claimed = 'claimed',
  unclaimed = 'unclaimed',
  pending = 'pending',
}

export const useRewards = (address: string | null | undefined, status = RewardStatus.unclaimed) => {
  const { data, error, loading } = useQuery(queryGetRewardsForWalletWithPaging, {
    variables: { address, status },
    fetchPolicy: 'no-cache',
  });

  return {
    data,
    error,
    loading,
  };
};

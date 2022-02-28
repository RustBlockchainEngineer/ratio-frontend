import { useQuery } from '@apollo/react-hooks';
import { queryGetRewardsForWalletWithPaging } from '../queries/rewards';

export enum MercurialRewardStatus {
  claimed = 'claimed',
  unclaimed = 'unclaimed',
  pending = 'pending',
}

export const useMercurialRewards = (address: string | null | undefined, status = MercurialRewardStatus.unclaimed) => {
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

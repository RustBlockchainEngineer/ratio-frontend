import { useMutation } from '@apollo/react-hooks';
import { queryClaimRewardForWallet } from '../queries/rewards';

export const useMercurialClaimRewards = (address: string | null | undefined, claimID: number) => {
  const [claimRewardsFnc, { data, loading, error }] = useMutation(queryClaimRewardForWallet, {
    variables: { id: claimID, walletAddress: address },
    fetchPolicy: 'no-cache',
  });

  return {
    claimRewardsFnc,
    data,
    error,
    loading,
  };
};

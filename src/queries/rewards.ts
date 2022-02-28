import gql from 'graphql-tag';

/**
 * Get first 3 rewards for a wallet
 * status: claimed|unclaimed|pending
 */
export const queryGetRewardsForWalletWithPaging = gql`
  query ($address: String!, $status: String!) {
    rewardsForWalletWithPaging(first: 3, address: $address, status: $status) {
      edges {
        cursor
        node {
          id
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
      }
      nodes {
        name
        paid
        transactionAddress
        campaign {
          name
        }
        id
      }
    }
  }
`;

/**
 * You can get the rewards for a wallet without pagination
 */
export const queryGetRewardForWallet = gql`
  query ($address: String!) {
    rewardsForWallet(address: $address) {
      ...RewardWallet
      __typename
    }
  }

  fragment RewardWallet on Reward {
    id
    name
    paid
    campaignId
    transactionAddress
    transactionStatus
    requiredMer
    campaign {
      id
      slug
      name
      __typename
    }
  }
`;

export const queryClaimRewardForWallet = gql`
  mutation Claim($id: ID!, $walletAddress: String!) {
    claim(id: $id, walletAddress: $walletAddress) {
      transactionAddress
      transactionStatus
      errors {
        detail
      }
    }
  }
`;

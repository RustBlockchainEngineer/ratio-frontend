import { publicKey, u64, u128, struct, u8, u16 } from '@project-serum/borsh';

export const QUARRY_INFO_LAYOUT = struct([
  u64('descriminator'),
  publicKey('rewarderKey'),
  publicKey('tokenMintKey'),
  u8('bump'),
  u16('index'),
  u8('tokenMintDecimals'),
  u64('famineTs'),
  u64('lastUpdateTs'),
  u128('rewardsPerTokenStored'),
  u64('annualRewardsRate'),
  u64('rewardsShare'),
  u64('totalTokensDeposited'),
  u64('numMiners'),
]);

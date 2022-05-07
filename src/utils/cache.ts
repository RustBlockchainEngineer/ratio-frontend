import BN from 'bn.js';

export const DEFAULT_GLOBAL_STATE = {
  bump: 255,
  authority: '2a5arshRYhr6sFfEQfjVGA4fwL4Cj9wgTJuZkLQau3fd',
  treasury: '2a5arshRYhr6sFfEQfjVGA4fwL4Cj9wgTJuZkLQau3fd',
  oracleReporter: '7Lw3e19CJUvR5qWRj8J6NKrV2tywiJqS9oDu1m8v4rsi',
  mintUsdr: 'GHmAAkHZxGvGno3jRehkC4CjGJh5qgxLKHF5tPqQLPg1',
  mintUsdrBump: 255,
  tvlCollatCeilingUsd: new BN('e8d4a51000', 'hex'),
  tvlUsd: new BN('00', 'hex'),
  tvlCollat: [new BN('00'), new BN('00'), new BN('00'), new BN('00')],
  paused: 0,
  totalDebt: new BN('00', 'hex'),
  debtCeilingGlobal: new BN('00', 'hex'),
  unusedDebtCeilingPool: new BN('00', 'hex'),
  debtCeilingUser: new BN('00', 'hex'),
  feeNum: new BN('1e', 'hex'),
  feeDeno: new BN('2710', 'hex'),
  collPerRisklv: [
    new BN('05e6c56d', 'hex'),
    new BN('05d44d57', 'hex'),
    new BN('05c24775', 'hex'),
    new BN('05a9c424', 'hex'),
    new BN('058b6c18', 'hex'),
    new BN('056e528d', 'hex'),
    new BN('055eaa6a', 'hex'),
    new BN('054f5b8c', 'hex'),
    new BN('054062ff', 'hex'),
    new BN('052369b1', 'hex'),
  ],
  mintableDebt: 1462.449616,
};

export const DEFAULT_ORACLE_STATE = {
  ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v']: {
    bump: 255,
    authority: '11111111111111111111111111111111',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    price: new BN('0f4240', 'hex'),
    decimals: 6,
    lastUpdatedTime: new BN('00', 'hex'),
  },
  ['Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB']: {
    bump: 255,
    authority: '11111111111111111111111111111111',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    price: new BN('0f4240', 'hex'),
    decimals: 6,
    lastUpdatedTime: new BN('00', 'hex'),
  },
};

export const DEFAULT_POOL_STATE = {
  '2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf': {
    bump: 254,
    mintCollat: '2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf',
    mintReward: 'iouQcQBAiEXe6cKLS85zmZxUqaCqBdeHFpqKoSz615u',
    tvlUsd: new BN('00', 'hex'),
    totalColl: new BN('00', 'hex'),
    totalDebt: new BN('00', 'hex'),
    debtCeiling: new BN('00', 'hex'),
    riskLevel: 0,
    platformType: 2,
    farmInfo: '11111111111111111111111111111111',
    swapTokenA: 'CfWX7o2TswwbxusJ4hCaPobu2jLCb1hfXuXJQjVq3jQF',
    swapTokenB: 'EnTrdMMpdhugeH6Ban6gYZWXughWxKtVGfCwFn78ZmY3',
    swapMintA: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    swapMintB: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    isPaused: 0,
    platformAPR: 0,
    oraclePrice: 0,
    currentPrice: '0',
    ratio: 0,
    mintDecimals: 6,
    mintSupply: new BN('00', 'hex'),
    platformTVL: 0,
  },
};

export const DEFAULT_USER_STATE = {
  totalDebt: new BN('00'),
  tvlUsd: new BN('00', 'hex'),
  activeVaults: new BN('00'),
};

export const DEFAULT_VAULT_STATE = {
  '2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf': {
    pool: DEFAULT_POOL_STATE['2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf'],
    mintCollat: '2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf',
    mintReward: '11111111111111111111111111111111',
    totalColl: new BN('00', 'hex'),
    tvlUsd: new BN('00', 'hex'),
    debt: 0,
    lastMintTime: new BN('00'),
    walletNonce: 0,
    mint: '2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf',
    reward: 0,
    lockedAmount: 0,
    debtLimit: 0,
    mintableDebt: 0,
    collPrice: 0,
    isReachedDebt: false,
  },
};

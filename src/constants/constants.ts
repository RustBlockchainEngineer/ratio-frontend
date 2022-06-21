export const REFRESH_TIME_INTERVAL = 60_000;
export const REWARD_TIME_INTERVAL = 1_000;
export const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001';

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const DEFAULT_NETWORK = process.env.REACT_APP_DEFAULT_NETWORK || 'mainnet';

export const Networks = [
  { value: 'mainnet', label: 'Mainnet' },
  { value: 'devnet', label: 'Devnet' },
];

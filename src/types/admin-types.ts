export interface CollateralizationRatios {
  cr_aaa_ratio: number;
  cr_aa_ratio: number;
  cr_a_ratio: number;
  cr_bbb_ratio: number;
  cr_bb_ratio: number;
  cr_b_ratio: number;
  cr_ccc_ratio: number;
  cr_cc_ratio: number;
  cr_c_ratio: number;
  cr_d_ratio: number;
}

export interface IIndexable {
  [key: string]: any;
}

export enum EmergencyState {
  RUNNING = 0,
  PAUSED = 1,
  UNKNOWN = -1,
}

export interface PlatformId {
  id: string;
}
export interface TokenSource {
  source: string;
  token_id: string;
}

export interface TokenCreation {
  address_id: string;
  symbol: string;
  icon: string;
  platforms: PlatformId[];
  token_ids: TokenSource[];
}

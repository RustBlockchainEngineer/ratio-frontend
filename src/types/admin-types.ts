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
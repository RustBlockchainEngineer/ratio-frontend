/* eslint-disable prettier/prettier */
import { ORCA_API } from './orca/constants';
import Axios from 'axios';

export async function getOrcaSwapPoolInfo() {
  const swapPoolsInfo: {
    [k: string]: any;
  } = {};
  const poolsData = (await Axios.get(`${ORCA_API}pools`)).data;
  for (let i = 0; i < poolsData.length; i++) {
    swapPoolsInfo[`${poolsData[i].name}`] = {
      account: poolsData[i].account,
      apy: poolsData[i].apy_24h,
      tvl: poolsData[i].liquidity,
    };
  }

  return swapPoolsInfo;
}

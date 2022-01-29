/* eslint-disable prettier/prettier */
import { mercurialApi } from './mercurial/constants';
import Axios from 'axios';

export async function getMercurialSwapPoolsInfo() {
  const swapPoolsInfo: {
    [k: string]: any;
  } = {};
  const pools = (await Axios(`${mercurialApi}pools`)).data;
  for (let i = 0; i < pools.length; i++) {
    swapPoolsInfo[`${pools[i].name}`] = {
      address: pools[i].address,
      apy: pools[i].apy.total,
      tvl: pools[i].tvl,
    };
  }
  return swapPoolsInfo;
}

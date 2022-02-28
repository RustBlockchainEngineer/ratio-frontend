/* eslint-disable prettier/prettier */
import { MERCURIAL_API } from './mercurial/constants';
import Axios from 'axios';

export async function getMercurialSwapPoolsInfo() {
  const swapPoolsInfo: {
    [k: string]: any;
  } = {};
  const pools = (await Axios(`${MERCURIAL_API}pools`)).data;
  for (let i = 0; i < pools.length; i++) {
    swapPoolsInfo[`${pools[i].name}`] = {
      address: pools[i].address,
      apy: pools[i].apy.total,
      tvl: pools[i].tvl,
      balances: pools[i].balances,
    };
  }
  return swapPoolsInfo;
}

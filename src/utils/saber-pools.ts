/* eslint-disable prettier/prettier */
import { Connection, PublicKey } from '@solana/web3.js';
import { StableSwap, loadExchangeInfoFromSwapAccount } from '@saberhq/stableswap-sdk';
import { getDevnetPools, getMainnetPools } from './saber/ids';
import { sleep } from './utils';
// import { SABER_QUARRY_NEW } from './saber/constants';

export async function loadSaberSwap(conn: Connection, swapAccount: PublicKey) {
  const stableSwapProgram = await StableSwap.load(conn, swapAccount);
  return stableSwapProgram;
}

export async function getSaberSwapPoolInfo(conn: Connection, swapAccount: PublicKey) {
  const exchangeInfo = await loadExchangeInfoFromSwapAccount(conn, swapAccount);

  const tokenAName = exchangeInfo?.reserves[0].amount.token.name;
  const tokenAAddress = exchangeInfo?.reserves[0].amount.token.address;
  const tokenAAmount = exchangeInfo?.reserves[0].amount.formatUnits().toString();

  const tokenBName = exchangeInfo?.reserves[1].amount.token.name;
  const tokenBAddress = exchangeInfo?.reserves[1].amount.token.address;
  const tokenBAmount = exchangeInfo?.reserves[1].amount.formatUnits().toString();

  const tvl = exchangeInfo?.lpTotalSupply.format().toString();

  return {
    tokenAName,
    tokenAAddress,
    tokenAAmount,
    tokenBName,
    tokenBAddress,
    tokenBAmount,
    tvl,
  };
}

export async function getSaberSwapPoolsInfo(conn: Connection, connEnv: string) {
  const swapPoolsInfo: {
    [k: string]: any;
  } = {};
  const pools = connEnv === 'devnet' ? await getDevnetPools() : await getMainnetPools();
  for (let i = 0; i < pools.length; i++) {
    const swapAccount = new PublicKey(pools[i].swapAddress);
    const poolAddr = pools[i].quarryAddress;

    const { tokenAName, tokenAAddress, tokenAAmount, tokenBName, tokenBAddress, tokenBAmount, tvl } =
      await getSaberSwapPoolInfo(conn, swapAccount);

    swapPoolsInfo[`${pools[i].name}`] = {
      poolAddr,
      tokenAName,
      tokenAAddress,
      tokenAAmount,
      tokenBName,
      tokenBAddress,
      tokenBAmount,
      tvl,
    };
    await sleep(600);
  }
  return swapPoolsInfo;
}

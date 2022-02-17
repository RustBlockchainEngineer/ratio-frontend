/* eslint-disable prettier/prettier */
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { StableSwap, loadExchangeInfoFromSwapAccount } from '@saberhq/stableswap-sdk';
import { getDevnetPools, getMainnetPools } from './saber/ids';

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

    if (poolAddr === 'BTimzTk51pcKxDQLRR3iFs4dLVY9WyKgRBmnd1rZLN6n') {
      swapPoolsInfo[`${pools[i].name}`] = {
        poolAddr,
        tokenAName: 'Token A',
        tokenAAddress: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
        tokenAAmount: '1000',
        tokenBName: 'Token B',
        tokenBAddress: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
        tokenBAmount: '1000',
        tvl: '20',
      };
    } else {
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
    }
  }
  return swapPoolsInfo;
}

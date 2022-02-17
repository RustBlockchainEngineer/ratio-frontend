/* eslint-disable prettier/prettier */
import Axios from 'axios';
import { access } from 'fs';
import { SABER_QUARRY_NEW } from '../constant-test';

export const SWAP_PROGRAM_ID = 'SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ';

export async function getDevnetPools() {
  const poolsData = (await Axios.get('https://registry.saber.so/data/pools-info.devnet.json')).data.pools;
  const swapPools = [];
  for (let i = 0; i < poolsData.length; i++) {
    const name = poolsData[i]?.name;
    const swapAddress = poolsData[i]?.swap?.config?.swapAccount;
    const quarryAddress = poolsData[i]?.quarry;
    if (name === 'USDC-CASH') {
      swapPools.push({
        name: 'USDC-CASH Mine',
        swapAddress: 'Gq1DjhsqjXTuCN8493XAgsU9fCzC1eGQ8iwL8CTYuFer',
        quarryAddress: SABER_QUARRY_NEW,
      });
    } else {
      swapPools.push({
        name,
        swapAddress,
        quarryAddress,
      });
    }
  }

  return swapPools;
}

// SABER POOLS AVAILABLE TESTNET POOLS
export async function getMainnetPools() {
  const poolsData = (await Axios.get('https://registry.saber.so/data/pools-info.mainnet.json')).data.pools;
  const swapPools = [];
  for (let i = 0; i < poolsData.length; i++) {
    const name = poolsData[i]?.name;
    const swapAddress = poolsData[i]?.swap?.config?.swapAccount;
    const quarryAddress = poolsData[i]?.quarry;
    swapPools.push({
      name,
      swapAddress,
      quarryAddress,
    });
  }
  return swapPools;
}

// DEFILLAMA-ADAPTERS  (IT IS AVAILABLE ONLY ON MAINNET)

// HELPER FUNCTION TO GET TOKEN BALANCES FROM DEFI LLAMA
async function getTokenAccountBalance(account: string) {
  const tokenBalance = await Axios.post(
    'https://solana-api.projectserum.com/',
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountBalance',
      params: [account],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return tokenBalance.data.result?.value?.uiAmount;
}

// IT IS NOT EXACTLY THE TVL OF EACH POOL. INSTEAD IT IS JUST THE TVL OF THE COMPLET TOKENS.
export async function getMainnetTVLTokens() {
  const { data: saberPools } = await Axios.get('https://registry.saber.so/data/llama.mainnet.json');

  const objectR: {
    [k: string]: any;
  } = {};

  const pools = await Promise.all(
    saberPools.map(async ({ reserveA = '', reserveB = '', tokenACoingecko = '', tokenBCoingecko = '' }) => {
      for (let i = 0; i < 5; i++) {
        try {
          return [
            {
              coingeckoID: tokenACoingecko,
              amount: await getTokenAccountBalance(reserveA),
            },
            {
              coingeckoID: tokenBCoingecko,
              amount: await getTokenAccountBalance(reserveB),
            },
          ];
        } catch (e) {
          console.log(e);
        }
      }
      throw new Error(`Can't get data: ${reserveA}, ${reserveB}`);
    })
  );

  return pools.flat().reduce((acc: any, pool: any) => {
    return {
      ...acc,
      [pool.coingeckoID]: (acc[pool.coingeckoID] ?? 0) + pool.amount,
    };
  }, {});
}

import { CoinGeckoAPI } from '@coingecko/cg-api-ts';
import { CoinGeckoTokenList } from './constants';
export const COINGECKO_API = 'https://api.coingecko.com/api/v3/';

export const getCoingecko = () => {
  return new CoinGeckoAPI(window.fetch.bind(window));
};

const checkCoingeckoStatus = async (coinGeckoHandler: any): Promise<boolean> => {
  const { data } = await getCoingeckoStatus(coinGeckoHandler);
  if (data) {
    return true;
  }
  return false;
};

export const getCoingeckoStatus = async (coinGeckoHandler: any) => {
  console.log(coinGeckoHandler);
  try {
    const { data, response, endpoint } = await coinGeckoHandler.getPing();
    console.log('COINGECKO SERVER ONLINE');
    return { data, response, endpoint };
  } catch (error) {
    console.log('COINGECKO SERVER NOT RESPONDING');
    console.error(error);
    return {
      data: false,
    };
  }
};

export const getCoinGeckoCoinsList = async (coinGeckoHandler: any) => {
  if (await checkCoingeckoStatus(coinGeckoHandler)) {
    const data = await coinGeckoHandler.getCoinsList();
    return data.data;
  }
};

export const getCoinsId = async (coinGeckoHandler: any) => {
  return await coinGeckoHandler.getCoinsId();
};

//simple/price?ids=bitcoin&vs_currencies=usd
export const getCoinGeckoUSDPrice = async (coinId: string) => {
  try {
    const data = await (await fetch(`${COINGECKO_API}simple/price?ids=${coinId}&vs_currencies=usd`)).json();
    const usdPrice = data[coinId]['usd'];
    return usdPrice;
  } catch (error) {
    throw await error;
  }
};

export const getCoinGeckoPrices = async () => {
  const tokenPrices: {
    [k: string]: any;
  } = {};
  for (const token in CoinGeckoTokenList) {
    tokenPrices[token] = await getCoinGeckoUSDPrice(CoinGeckoTokenList[token]);
  }
  return tokenPrices;
};

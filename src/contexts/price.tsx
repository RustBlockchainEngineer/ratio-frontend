import React, { useContext, useEffect, useMemo, useState } from 'react';
import Axios from 'axios';
import { useRaydiumPools } from './pools';

interface PriceConfig {
  prices: any;
  setPrices: (val: any) => void;
}

const PriceContext = React.createContext<PriceConfig>({
  prices: {},
  setPrices: () => {},
});

export function PriceProvider({ children = undefined as any }) {
  const [prices, setPrices] = useState<any>({});

  useEffect(() => {
    Axios('https://price-api.sonar.watch/prices').then((res) => {
      if (res && res.data) {
        const tmpPrices: any = {};
        res.data.forEach((item: any) => {
          tmpPrices[item.mint] = item.price;
        });
        setPrices({
          ...tmpPrices,
          ...prices,
        });
      }
    });
  }, []);

  return (
    <PriceContext.Provider
      value={{
        prices,
        setPrices,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
}

export const usePrices = () => {
  return useContext(PriceContext)?.prices;
};

export const usePrice = (mint: string) => {
  return Number(process.env.REACT_APP_LP_TOKEN_PRICE);
  const prices = useContext(PriceContext)?.prices;
  const setPrices = useContext(PriceContext)?.setPrices;
  const [price, setPrice] = useState<number>(0);
  const pools = useRaydiumPools();

  useEffect(() => {
    if (prices[mint]) {
      setPrice(prices[mint]);
    } else if (pools) {
      // const poolInfo = pools[mint];
      const poolInfo = pools['HwzkXyX8B45LsaHXwY8su92NoRBS5GQC32HzjQRDqPnr'];

      const coin = (poolInfo as any).coin as any;
      const pc = (poolInfo as any).pc as any;
      const lp = (poolInfo as any).lp;
      const coinPrice = prices[coin.mintAddress];
      const pcPrice = prices[pc.mintAddress];
      const lpSupply = Number(lp.totalSupply.fixed());

      const tmpPrice = (coinPrice * Number(coin.balance.fixed()) + pcPrice * Number(pc.balance.fixed())) / lpSupply;

      const tmpPrices = {
        ...prices,
      };

      tmpPrices[mint] = tmpPrice;

      setPrices(tmpPrices);
      setPrice(tmpPrice);
    }
  }, [mint, pools]);

  return price;
};

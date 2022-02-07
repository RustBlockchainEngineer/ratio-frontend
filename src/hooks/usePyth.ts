/* eslint-disable prettier/prettier */
import { useCallback, useEffect, useState } from 'react';
import { getPythProgramKeyForCluster, PythConnection } from '@pythnetwork/client';
import { Connection, Cluster } from '@solana/web3.js';
import { ENV, useConnectionConfig } from '../contexts/connection';

function getClusterFromEndpoint(env: ENV): Cluster {
  switch (env) {
    case 'devnet':
      return 'devnet';
    case 'testnet':
      return 'testnet';
    case 'mainnet-beta':
      return 'mainnet-beta';
    default:
      return 'devnet';
  }
}

export function usePyth(connection: Connection) {
  const env = useConnectionConfig().env;
  const [usdPrice, setPrice] = useState<any>({ price: 'not defined', confidence: 'not defined' });
  const pythConnection = new PythConnection(connection, getPythProgramKeyForCluster(getClusterFromEndpoint(env)));

  const handleOnPriceChange = useCallback((product, price) => {
    /**
     * Look for specific changes in USDC/USD
     * Make sure the price has varied
     * */
    if (product?.description === 'USDC/USD' && product?.symbol === 'Crypto.USDC/USD') {
      setPrice({
        price: price?.price,
        confidence: price?.confidence,
      });
    }
  }, []);

  useEffect(() => {
    pythConnection.onPriceChange((product, price) => {
      handleOnPriceChange(product, price);
    });

    return function cleanup() {
      //Stop listening to price changes events
      pythConnection.stop();
    };
  }, [handleOnPriceChange]);

  // Start listening for price change events.
  pythConnection.start();

  return usdPrice;
}

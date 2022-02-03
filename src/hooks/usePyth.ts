/* eslint-disable prettier/prettier */
import { useState } from 'react';
import { getPythProgramKeyForCluster, PythConnection } from "@pythnetwork/client";
import { Connection, Cluster } from '@solana/web3.js';
import { useConnectionConfig } from '../contexts/connection';


export function usePyth(connection: Connection){
    const [usdPrice,setPrice] = useState<any>({price: 'not defined', confidence:'not defined'});
    const pythConnection = new PythConnection(connection,getPythProgramKeyForCluster('devnet'));
    
    pythConnection.onPriceChange((product,price) => {
        /**
         * Look for specific changes in USDC/USD
         * Make sure the price has varied
         * */
        if(product?.description === 'USDC/USD' && product?.symbol === 'Crypto.USDC/USD'){
            setPrice({
                price: price?.price,
                confidence: price?.confidence
            })
        }
    })

    // Start listening for price change events.
    pythConnection.start();

    return usdPrice;
}
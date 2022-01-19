/* eslint-disable prettier/prettier */
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js"
import { StableSwap, loadExchangeInfoFromSwapAccount } from '@saberhq/stableswap-sdk';
import { DEVNET_SABER_POOLS, MAINNET_SABER_POOLS } from "./saber/ids";

const getPoolName = (poolAddr:string, env:string) => {
    if(env === 'devnet'){
        switch(poolAddr){
            case 'AQsYrKkFLuv9Jw7kCcPH7SkeMQ2aZkP1KcBs4RYegHbv':
                return 'btc';
            case 'B94iYzzWe7Q3ksvRnt5yJm6G5YquerRFKpsUVUvasdmA':
                return 'usdc_cash';
            case 'DoycojcYVwc42yCpGb4CvkbuKJkQ6KBTugLdJXv3U8ZE':
                return 'usdc_pai';
            case 'AqBGfWy3D9NpW8LuknrSSuv93tJUBiPWYxkBrettkG7x':
                return 'usdc_test';
            case 'VeNkoB1HvSP6bSeGybQDnx9wTWFsQb2NBCemeCDSuKL':
                return 'usdc_usdt';
            case 'TEJVTFTsqFEuoNNGu864ED4MJuZr8weByrsYYpZGCfQ':
                return 'usdt_cash';
            default:
                return 'unknown';
        }
    }else{
        return 'unkown';
    }
}

const getListOfPools = (env:string) => {
    if(env === 'devnet') return DEVNET_SABER_POOLS;
    return MAINNET_SABER_POOLS;
}

export async function loadSaberSwap(conn: Connection, swapAccount: PublicKey){
    const stableSwapProgram = await StableSwap.load(conn,swapAccount);
    return stableSwapProgram;
}

export async function getSaberSwapPoolInfo(conn:Connection, swapAccount: PublicKey){
    const exchangeInfo = await loadExchangeInfoFromSwapAccount(conn,swapAccount);

    const tokenAName = exchangeInfo?.reserves[0].amount.token.name;
    const tokenAAddress = exchangeInfo?.reserves[0].amount.token.address;
    const tokenAAmount = exchangeInfo?.reserves[0].amount.formatUnits().toString();

    const tokenBName = exchangeInfo?.reserves[1].amount.token.name;
    const tokenBAddress = exchangeInfo?.reserves[1].amount.token.address;
    const tokenBAmount = exchangeInfo?.reserves[1].amount.formatUnits().toString();
    
    return {
        tokenAName,
        tokenAAddress,
        tokenAAmount,
        tokenBName,
        tokenBAddress,
        tokenBAmount,
    };
}

export async function getSaberSwapPoolsInfo(conn:Connection,connEnv:string,poolsAddresses?:[string]){
    const swapPoolsInfo : {
        [k:string]: any
    } = {};
    const pools = poolsAddresses || getListOfPools(connEnv);
    for(let i = 0; i < pools.length; i++){
        const swapAccount = new PublicKey(pools[i]);
        const {tokenAName, tokenAAddress, tokenAAmount, tokenBName, tokenBAddress, tokenBAmount} = await getSaberSwapPoolInfo(conn,swapAccount);
        swapPoolsInfo[`${getPoolName(pools[i],connEnv)}-tokenA`] = tokenAName;
        swapPoolsInfo[`${getPoolName(pools[i],connEnv)}-tokenA-address`] = tokenAAddress;
        swapPoolsInfo[`${getPoolName(pools[i],connEnv)}-tokenAAmount`] = tokenAAmount; 
        swapPoolsInfo[`${getPoolName(pools[i],connEnv)}-tokenB`] = tokenBName;
        swapPoolsInfo[`${getPoolName(pools[i],connEnv)}-tokenB-address`] = tokenBAddress;
        swapPoolsInfo[`${getPoolName(pools[i],connEnv)}-tokenBAmount`] = tokenBAmount;
    }
    return swapPoolsInfo;
}
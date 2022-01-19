/* eslint-disable prettier/prettier */
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js"
import { StableSwap, loadExchangeInfoFromSwapAccount } from '@saberhq/stableswap-sdk';
import { getDevnetPools, getMainnetPools } from "./saber/ids";

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

export async function getSaberSwapPoolsInfo(conn:Connection,connEnv:string){
    const swapPoolsInfo : {
        [k:string]: any
    } = {};
    const pools = connEnv === 'devnet' ? await getDevnetPools() : await getMainnetPools();
    for(let i = 0; i < pools.length; i++){
        const swapAccount = new PublicKey(pools[i].address);
        const {tokenAName, tokenAAddress, tokenAAmount, tokenBName, tokenBAddress, tokenBAmount} = await getSaberSwapPoolInfo(conn,swapAccount);
        swapPoolsInfo[`${pools[i].name}-tokenA`] = tokenAName;
        swapPoolsInfo[`${pools[i].name}-tokenA-address`] = tokenAAddress;
        swapPoolsInfo[`${pools[i].name}-tokenAAmount`] = tokenAAmount; 
        swapPoolsInfo[`${pools[i].name}-tokenB`] = tokenBName;
        swapPoolsInfo[`${pools[i].name}-tokenB-address`] = tokenBAddress;
        swapPoolsInfo[`${pools[i].name}-tokenBAmount`] = tokenBAmount;
    }
    return swapPoolsInfo;
}
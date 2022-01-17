/* eslint-disable prettier/prettier */
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js"
import { StableSwap } from '@saberhq/stableswap-sdk';
import { SWAP_PROGRAM_ID } from "./saber/ids";

export async function loadSaberSwap(conn: Connection, swapAccount: PublicKey){
    const stableSwapProgram = await StableSwap.load(conn,swapAccount);
    return stableSwapProgram;
}

export async function getSaberSwapPoolInfo(conn:Connection, swapAccount: PublicKey){
    const stableSwapProgram = await loadSaberSwap(conn,swapAccount);
    const tokenA = stableSwapProgram.state.tokenA;
    const tokenB = stableSwapProgram.state.tokenB;
    return {
        tokenA,
        tokenB
    };
}

export async function getSaberSwapPoolsInfo(conn:Connection, swapAccounts: [PublicKey]){
    const swapPoolsInfo : {
        [k:string]: any
    } = {};
    for(let i = 0; i < swapAccounts.length; i++){
        const {tokenA, tokenB} = await getSaberSwapPoolInfo(conn,swapAccounts[i]);
        swapPoolsInfo[`${swapAccounts[i].toString()}-tokenA`] = tokenA;
        swapPoolsInfo[`${swapAccounts[i].toString()}-tokenB`] = tokenB;
    }
    return swapPoolsInfo;
}
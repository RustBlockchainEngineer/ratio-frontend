/* eslint-disable prettier/prettier */
import Axios from 'axios';

export const SWAP_PROGRAM_ID = 'SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ';

export async function getDevnetPools() {
    const poolsData = (await Axios.get('https://registry.saber.so/data/pools-info.devnet.json')).data.pools;
    const swapPools = [];
    for(let i = 0; i < poolsData.length; i++){
        const poolName = poolsData[i].name;
        const swapAccount = poolsData[i].swap.config.swapAccount;
        swapPools.push({
            name: poolName,
            address: swapAccount,
        });
    }
    console.log('swapPools DEVNET');
    console.log(swapPools);
    return swapPools;
}

// SABER POOLS AVAILABLE TESTNET POOLS
export async function getMainnetPools() {
    const poolsData = (await Axios.get('https://registry.saber.so/data/pools-info.mainnet.json')).data.pools;
    const swapPools = [];
    for(let i = 0; i < poolsData.length; i++){
        const poolName = poolsData[i].name;
        const swapAccount = poolsData[i].swap.config.swapAccount;
        swapPools.push({
            name: poolName,
            address: swapAccount,
        });
    }
    return swapPools;
}
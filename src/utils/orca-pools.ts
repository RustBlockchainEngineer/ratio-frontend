/* eslint-disable prettier/prettier */
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js"
import { getOrca, OrcaPoolConfig, Network } from "@orca-so/sdk";
import Decimal from "decimal.js";
import Axios from "axios";

export async function getOrcaSwapPoolInfo(conn:Connection){
    const orca = getOrca(conn,Network.DEVNET);
    const orcaSolPool = orca.getPool(OrcaPoolConfig.ORCA_SOL);
    const orcaToken = orcaSolPool.getTokenA();
    const solToken = orcaSolPool.getTokenB();
    
    const data = await orcaSolPool.getLPSupply();

    const pools  = Axios.get('https://api.orca.so/pools').then((res) => {
        console.log('------- ORCA POOLS API -------');
    });

    
    return {
        orcaToken,
        solToken
    };
}
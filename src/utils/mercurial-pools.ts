/* eslint-disable prettier/prettier */
import { mercurialApi } from "./mercurial/constants";
import Axios from "axios";

export async function getMercurialSwapPoolsInfo(){
    const swapPoolsInfo : {
        [k:string]: any
    } = {};
    const mercurialData = await Axios(`${mercurialApi}pools`).then((res) => {
        console.log('RES');
        console.log(res);
        console.log('-------');
    })
    return swapPoolsInfo;
}
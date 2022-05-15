/* eslint-disable prettier/prettier */
import { TransactionResponse } from '@solana/web3.js';
import { API_ENDPOINT } from '../../constants';
export type TxStatus = 'Waiting Confirmation ...' | 'Not Confirmed' | 'Failed' | 'Success';


export const getBalanceChange = (txInfo: TransactionResponse | null,wallet_address: string, mint_address: string): number => {
    
  const tk_pre_balance = txInfo?.meta?.preTokenBalances;
  const tk_post_balance = txInfo?.meta?.postTokenBalances;
  let pretx = undefined;
  let posttx = undefined;
  let post_amount = 0;
  let pre_amount = 0;

  if(tk_post_balance){
      const post = tk_post_balance.filter((ele) => {return ele.owner === wallet_address && ele.mint === mint_address}); 
      if (post)
          posttx = post[0];
      if(posttx)
          if (posttx.uiTokenAmount.uiAmount)
              post_amount = posttx.uiTokenAmount.uiAmount;
  }

  if(tk_pre_balance){
      const pre = tk_pre_balance.filter((ele) => {return ele.owner === wallet_address && ele.mint === mint_address});   
      if(pre)
          pretx = pre[0];
      if(pretx)
          if (pretx.uiTokenAmount.uiAmount)
              pre_amount = pretx.uiTokenAmount.uiAmount;
  }
  if(posttx && pretx)
      return post_amount - pre_amount;
  else 
    return 0;
}


export function prepareTransactionData(action: string, collMint: string, affectedMint: string, amount: number, txHash: string, status: TxStatus) {
  return {
    tx_type: action,
    address_id: affectedMint,
    signature: txHash,
    vault_address: collMint,
    status: status,
    amount: amount,
  };
}

export async function postToRatioApi(data, route, authToken?: any) {
  if (authToken) {
    return await postWithAuthToRatioApi(data, route, authToken);
  } else {
    const response = await fetch(`${API_ENDPOINT}${route}`, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    if (!response.ok) {
      throw await response.json();
    }
    return await response.json();
  }
}

export async function postWithAuthToRatioApi(data: any, route: string, authToken: any) {
  const response = await fetch(`${API_ENDPOINT}${route}`, {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': JSON.stringify(authToken),
    },
    method: 'POST',
  });
  console.log('RESPONSE ', response);
  if (!response.ok) {
    throw await response.json();
  }
  return await response.json();
}

export async function getFromRatioApi(route = '', authToken: any) {
  const response = await fetch(`${API_ENDPOINT}/${route}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': JSON.stringify(authToken),
    },
    method: 'GET',
  });
  if (!response.ok) {
    throw await response.json();
  }
  return await response.json();
}

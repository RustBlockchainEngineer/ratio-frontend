/* eslint-disable prettier/prettier */
import { API_ENDPOINT } from '../../constants';

export async function postToRatioApi(data = {}, route = '', authToken?: any) {
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

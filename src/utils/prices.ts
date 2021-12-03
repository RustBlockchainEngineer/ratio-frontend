import Axios from 'axios';

export async function getPriceWithTokenAddress(mintAddress: string) {
  const response = await Axios('https://price-api.sonar.watch/prices');

  const token = response.data.filter((value: { mint: string }) => value.mint === mintAddress);
  if (token.length > 0) {
    return token[0].price;
  }
  return 0;
}

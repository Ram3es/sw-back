export interface SteamItem {
  id: string;
  name: string;
  assetId: string;
  classid: string;
  image: string;
  appid: string;
  price: number;
}

export interface ItemToValidate {
  appid: number;
  assetid: string;
  amount: number;
  name: string;
}

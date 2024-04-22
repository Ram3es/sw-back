export interface MarketOffer {
  appid: number;
  imageUrl: string;
  inventoryItemId: string;
  price: Price;
  steamPrice: Price;
  wearFloat: number | undefined;
  rarity: string;
  typeName: string;
  name: string;
}

export interface Price {
  amount: number;
  currency: string;
}

//mock filters
export interface OfferFilters {
  pattern: string;
  priceFrom: number;
  priceTo: number;
  wearFrom: number;
  wearTo: number;
  tradableIn: number;
  quality: string;
  rarity: string;
}

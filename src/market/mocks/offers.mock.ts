import offers from './csgo/offers.json';
import sortByOptions from './csgo/sortBy.json';
import filters from './csgo/filters.json';
import rustOffers from './rust/offers.json';
import rustSortByOptions from './rust/sortBy.json';
import rustFilters from './rust/filters.json';
import offersHistory from './csgo/offers-history.json';
import { ESteamAppId } from 'src/constants';

export const mockOffers = (
  appid: string,
  page: number,
  limit: number,
  sortBy: string,
) => {
  const mock = appid === ESteamAppId.RUST ? [...rustOffers] : [...offers];
  const sortedMock = mock.sort((a, b) => {
    // can be sorted by Expensive, Cheapest, HotDeals, Newest, HighestWear, LowestWear
    if (sortBy === 'Expensive') return b.price.amount - a.price.amount;
    if (sortBy === 'Cheapest') return a.price.amount - b.price.amount;
    if (sortBy === 'HotDeals') return b.hotDeals;
    if (sortBy === 'HighestWear') return b.wearFloat - a.wearFloat;
    if (sortBy === 'LowestWear') return a.wearFloat - b.wearFloat;

    return 0;
  });
  console.log('sortedMock', sortedMock);
  return sortedMock.splice((page - 1) * limit, limit) as any[]; // temporary fix for mocks
};

export const mockGetAllOffers = (appid: string) => {
  const mock = appid === ESteamAppId.RUST ? [...rustOffers] : [...offers];
  return mock as any[];
};

export const findOfferById = (id: string) => {
  const mock = [...offers, ...rustOffers];
  return mock.find((offer) => offer.inventoryItemId === id);
};

export const mockSortBy = (appid: string) => {
  return appid === ESteamAppId.RUST
    ? [...rustSortByOptions]
    : [...sortByOptions];
};

export const mockOffersHistory = () => [...offersHistory];

export const mockFilters = (appid: string) => {
  return appid === ESteamAppId.RUST ? [...rustFilters] : [...filters];
};

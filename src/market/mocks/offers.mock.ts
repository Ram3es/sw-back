import offers from './csgo/offers.json';
import sortByOptions from './csgo/sortBy.json';
import filters from './csgo/filters.json';
import rustOffers from './rust/offers.json';
import rustSortByOptions from './rust/sortBy.json';
import rustFilters from './rust/filters.json';
import offersHistory from './csgo/offers-history.json';
import { ESteamAppId } from 'src/constants';

export const mockOffers = (appid: string, page: number, limit: number) => {
  const mock = appid === ESteamAppId.RUST ? [...rustOffers] : [...offers];
  console.log('mock', mock);
  return mock.splice((page - 1) * limit, limit) as any[]; // temporary fix for mocks
};

export const mockGetAllOffers = (appid: string) => {
  const mock = appid === ESteamAppId.RUST ? [...rustOffers] : [...offers];
  return mock as any[];
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

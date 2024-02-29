import offers from './csgo/offers.json';
import sortByOptions from './csgo/sortBy.json';
import filters from './csgo/filters.json';
import rustOffers from './rust/offers.json';
import rustSortByOptions from './rust/sortBy.json';
import rustFilters from './rust/filters.json';
import offersHistory from './csgo/offers-history.json';
import { ESteamAppId } from 'src/constants';

export const mockOffers = (appid: string) => {
  const mock = appid === ESteamAppId.RUST ? [...rustOffers] : [...offers];
  return mock as any[];
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

export const getLastElemAsPlaceholder = (appid: string) => {
  return appid === ESteamAppId.RUST
    ? [...rustOffers][rustOffers.length - 1]
    : [...offers][offers.length - 1];
};

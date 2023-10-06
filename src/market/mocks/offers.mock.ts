import offers from './offers.json';
import sortByOptions from './sortBy.json';
import offersHistory from './offers-history.json';
import filters from './filters.json';

export const mockOffers = (appid: string, page: number, limit: number) => {
  return offers
    .filter((item) => item.appid === Number(appid))
    .splice((page - 1) * limit, limit);
};

export const mockGetAllOffers = (appid: string) => {
  if (!appid) return offers;
  return offers.filter((item) => item.appid === Number(appid));
};

export const mockSortBy = () => sortByOptions;

export const mockOffersHistory = () => offersHistory;

export const mockFilters = () => filters;

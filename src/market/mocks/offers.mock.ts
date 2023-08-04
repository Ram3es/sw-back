import offers from './offers.json';
import sortByOptions from './sortBy.json';

export const mockOffers = (appid: string, page: number, limit: number) => {
  return offers
    .filter((item) => item.appid === Number(appid))
    .splice((page - 1) * limit, limit);
};

export const mockGetAllOffers = (appid: string) => {
  return offers.filter((item) => item.appid === Number(appid));
};

export const mockSortBy = () => sortByOptions;

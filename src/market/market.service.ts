import { Injectable } from '@nestjs/common';
import { MarketOffer } from './types';
import { mockOffers, mockSortBy } from './mocks/offers.mock';
import { PAGE_LIMIT } from 'src/constants';

@Injectable()
export class MarketService {
  async getOffers(
    appid: string,
    sortBy: string,
    page: number,
  ): Promise<{
    total: number;
    offers: MarketOffer[];
    sortBy: string;
    sortByOptions: { name: string; label: string }[];
  }> {
    const TOTAL_PLACEHOLDER = 1248;

    const offers = mockOffers(appid, page, PAGE_LIMIT);
    return {
      total: TOTAL_PLACEHOLDER,
      sortByOptions: mockSortBy(),
      sortBy: sortBy || 'HotDeals',
      offers: offers,
    };
  }
}

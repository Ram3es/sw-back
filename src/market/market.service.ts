import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { PinoLogger } from 'nestjs-pino';
import { MarketOffer, OfferFilters } from './types';
import {
  mockOffers,
  mockSortBy,
  mockGetAllOffers,
  mockOffersHistory,
  mockFilters,
} from './mocks/offers.mock';
import { ESteamAppId, PAGE_LIMIT } from 'src/constants';
import { randomUUID, generateKeySync } from 'node:crypto';

@Injectable()
export class MarketService {
  constructor(
    @Inject('DB_CONNECTION') private conn: Pool,
    private readonly logger: PinoLogger,
  ) {}

  async getOnSiteInventory(steamId: string, appid?: string) {
    try {
      const [inventory] = await this.conn.query(
        `
          SELECT assetId, withdrawn, createdAt, updatedAt FROM user_items
          WHERE userId = ?
        `,
        [steamId],
      );

      const items = inventory
        // @ts-expect-error need to fix
        .map((entity) => {
          const item = mockGetAllOffers(ESteamAppId.CSGO).find(
            (item) => item.inventoryItemId === entity.assetId,
          );
          if (!item) return;
          return { ...item, ...entity };
        })
        .filter((item) => item);

      return appid ? items.filter((item) => item.appid === appid) : items;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async addItemsToInventory(steamId: string, items: string[]) {
    for await (const assetId of items) {
      const item = mockGetAllOffers(ESteamAppId.CSGO).find(
        (item) => item.inventoryItemId === assetId,
      );
      if (!item) {
        throw new BadRequestException([
          `there is no item with assetId: ${assetId}`,
        ]);
      }
    }

    const values = items.map((item) => `(${steamId}, '${item}')`);

    try {
      await this.conn.query(
        `
        INSERT INTO user_items (userId, assetId)
        VALUES ${values.join(',')}
      `,
      );
    } catch (error) {
      this.logger.warn(error);
      const err =
        error.errno && error.errno === 1062
          ? new BadRequestException('Duplicate entry')
          : new BadRequestException();
      throw err;
    }
  }

  async withdrawItems(steamId: string, items) {
    try {
      const transactionId = randomUUID();
      for await (const item of items) {
        await this.conn.query(
          `
          UPDATE user_items
          SET withdrawn = 1, transactionId = ?
          WHERE userId = ? AND assetId = ?
        `,
          [transactionId, steamId, item],
        );
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getOffers(
    appid: string,
    sortBy: string,
    page: number,
    filters: OfferFilters,
  ): Promise<{
    total: number;
    offers: MarketOffer[];
    sortBy: string;
    sortByOptions: { name: string; label: string }[];
    defaultFilters: any[];
  }> {
    const TOTAL_PLACEHOLDER = 1248;
    const offers = mockOffers(appid, page, PAGE_LIMIT);
    console.log('offers', offers);
    const filterdOffers = offers.filter((offer) => {
      if (filters.pattern) {
        const pattern = new RegExp(filters.pattern, 'i');
        if (!pattern.test(offer.name)) return false;
      }
      if (filters.priceFrom) {
        if (offer.price.amount < filters.priceFrom) return false;
      }
      if (filters.priceTo) {
        if (offer.price.amount > filters.priceTo) return false;
      }
      if (filters.wearFrom) {
        if (offer.wearFloat < filters.wearFrom) return false;
      }
      if (filters.wearTo) {
        if (offer.wearFloat > filters.wearTo) return false;
      }
      if (filters.tradableIn) {
        if (offer.tradableIn < filters.tradableIn) return false;
      }
      if (filters.quality) {
        const qualityArray = filters.quality.split(',');
        if (!qualityArray.includes(offer.quality)) return false;
      }
      if (filters.rarity) {
        const rarityArray = filters.rarity.split(',');
        if (!rarityArray.includes(offer.rarity)) return false;
      }
      return true;
    });
    const filtersData = mockFilters(appid);
    return {
      total: TOTAL_PLACEHOLDER,
      sortByOptions: mockSortBy(appid),
      sortBy: sortBy || 'HotDeals',
      offers: filterdOffers,
      defaultFilters: filtersData,
    };
  }

  async getTransactions(steamId: string) {
    const [withdraws]: any = await this.conn.query(
      `SELECT assetId, withdrawn, createdAt, updatedAt, transactionId
       FROM user_items WHERE userId = ? AND withdrawn = 1`,
      [steamId],
    );

    const withdrawsByTransactionId: [key: [any]] = this.groupBy(
      withdraws,
      'transactionId',
    );
    const transactions = [];

    for (const [transaction, transaction_items] of Object.entries(
      withdrawsByTransactionId,
    )) {
      const security_token = generateKeySync('hmac', { length: 128 })
        .export()
        .toString('hex');

      const items = transaction_items
        .map((entity) => {
          const item = mockGetAllOffers(ESteamAppId.CSGO).find(
            (item) => item.inventoryItemId === entity.assetId,
          );
          if (!item) return;
          return { ...item, ...entity };
        })
        .filter((item) => item);

      const now = new Date();
      const expired_at = new Date().setHours(now.getHours() + 24);

      transactions.push({
        items,
        bot_name: 'bip-bop im bot',
        createdAt: now,
        security_token,
        accepted: true,
        expired_at: new Date(expired_at),
        browser_confiramation_url: 'https://skinwallet.itsua.co/' + transaction,
        steam_confiramation_url: 'https://steam.com/' + transaction,
      });
    }
    return transactions;
  }

  getOffer(offerId: string) {
    const offer = mockGetAllOffers(null).find(
      (item) => item.inventoryItemId === offerId,
    );
    if (!offer) {
      throw new BadRequestException([`there is no offer with id: ${offerId}`]);
    }
    return offer;
  }

  getSimilarOffers(appid, parameters) {
    const offers = mockGetAllOffers(appid);
    console.log('parameters', parameters);

    // temporaryry for test slice 10 offers and return in random order
    const similarOffers = offers.slice(0, 10).sort(() => Math.random() - 0.5);
    return { similarOffers };
  }

  getOffersHistory(offerId: string) {
    // temporaryry for test return mock data

    return { offershHistory: mockOffersHistory() };
  }

  private groupBy(arr, key) {
    return arr.reduce(
      (acc, item) => (
        (acc[item[key]] = [...(acc[item[key]] || []), item]), acc
      ),
      {},
    );
  }
}

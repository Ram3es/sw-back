import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { PinoLogger } from 'nestjs-pino';
import { BuyItemDTO } from './dto/buy-items.dto';
import { MarketOffer } from './types';
import { mockOffers, mockSortBy } from './mocks/offers.mock';
import { PAGE_LIMIT } from 'src/constants';

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
          SELECT steam_id, name, assetid, classid, image, appid, price, withdrawn, created_at, updated_at FROM user_item
          WHERE steam_id = ?
        `,
        [steamId],
      );
      return inventory;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async addItemsToInventory(steamId: string, items: BuyItemDTO[]) {
    try {
      for await (const item of items) {
        const { name, assetid, classid, image, price, appid } = item;
        await this.conn.query(
          `
          INSERT INTO user_item (steam_id, appid, name, assetid, classid, image, price)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [steamId, appid, name, assetid, classid, image, price],
        );
      }
    } catch (error) {
      this.logger.warn(error);
    }
  }

  async withdrawItems(steamId: string, items) {
    try {
      for await (const item of items) {
        await this.conn.query(
          `
          UPDATE user_item
          SET withdrawn = 1
          WHERE steam_id = ? AND assetid = ?
        `,
          [steamId, item],
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

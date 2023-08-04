import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { PinoLogger } from 'nestjs-pino';
import { MarketOffer } from './types';
import { mockOffers, mockSortBy, mockGetAllOffers } from './mocks/offers.mock';
import { ESteamAppId, PAGE_LIMIT } from 'src/constants';

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
          SELECT assetid, withdrawn, created_at, updated_at FROM user_item
          WHERE steam_id = ?
        `,
        [steamId],
      );

      const items = inventory
        // @ts-expect-error need to fix
        .map((entity) => {
          const item = mockGetAllOffers(ESteamAppId.CSGO).find(
            (item) => item.inventoryItemId === entity.assetid,
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
    for await (const assetid of items) {
      const item = mockGetAllOffers(ESteamAppId.CSGO).find(
        (item) => item.inventoryItemId === assetid,
      );
      if (!item) {
        throw new BadRequestException([
          `there is no item with assetid: ${assetid}`,
        ]);
      }
    }

    const values = items.map((item) => `(${steamId}, ${item})`);

    try {
      await this.conn.query(
        `
        INSERT INTO user_item (steam_id, assetid)
        VALUES ${values.join(',')}
      `,
      );
    } catch (error) {
      this.logger.warn(error);
      throw new BadRequestException();
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

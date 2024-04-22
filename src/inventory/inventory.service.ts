import { Inject, Injectable } from '@nestjs/common';
import { mockSteamItems } from './mocks/steam-items.mock';
import { SteamService } from 'src/steam/steam.service';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('DB_CONNECTION') private conn: any,
    private readonly steamService: SteamService,
  ) {}

  async getInventory(steamId: string, appid: string) {
    const [data] = await this.conn.query(`
    SELECT * FROM user_items
    `);
    return mockSteamItems(steamId, appid);
  }

  async allActiveTrades(steamId: string) {
    try {
      const [tradeOffers] = await this.conn.query(
        `
        SELECT 
        uto.*,
        JSON_OBJECT(
          'id', ba.id,
          'name', ba.name,
          'level', ba.level,
          'avatarHash', ba.avatarHash,
          'botSteamId', ba.botSteamId,
          'memberSince', ba.memberSince
        ) as botProfile,
        JSON_ARRAYAGG(JSON_OBJECT(
          'appid', ti.appId,
          'assetid', ti.assetId,
          'amount', ti.amount,
          'icon_url', ti.iconUrl,
          'name', ti.name
        )) as trade_items
        FROM user_trade_offers as uto
        LEFT JOIN bot_accounts as ba ON ba.id = uto.botId
        LEFT JOIN trade_items as ti ON ti.tradeId = uto.tradeId
        WHERE steamId = ?
        GROUP BY uto.id
       `,
        [steamId],
      );
      if (!tradeOffers) {
        return [];
      }

      return tradeOffers;
    } catch (error) {
      console.log(error);
    }
  }
}

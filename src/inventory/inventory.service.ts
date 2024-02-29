import { Inject, Injectable } from '@nestjs/common';
import { mockSteamItems } from './mocks/steam-items.mock';
import { Pool } from 'mysql2/promise';

@Injectable()
export class InventoryService {
  constructor(@Inject('DB_CONNECTION') private conn: Pool) {}

  async getInventory(steamId: string, appid: string) {
    const [data] = await this.conn.query(`
    SELECT * FROM user_items
    `)
    return mockSteamItems(steamId, appid);
  }
}

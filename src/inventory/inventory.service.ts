import { Injectable } from '@nestjs/common';
import { mockSteamItems } from './mocks/steam-items.mock';

@Injectable()
export class InventoryService {
  async getInventory(steamId: string, appid: string) {
    return mockSteamItems(steamId, appid);
  }
}

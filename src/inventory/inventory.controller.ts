import { Controller, Get, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Request } from 'express';
import { ESteamAppId } from 'src/constants/inxex';
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventory(@Req() req: Request) {
    const user = req?.user;
    const appid = (req?.query?.appid as string) || ESteamAppId.CSGO;
    return await this.inventoryService.getInventory(user.id, appid);
  }
}

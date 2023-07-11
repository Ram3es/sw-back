import { Controller, Get, Query, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Request } from 'express';
import { ESteamAppId } from 'src/constants/inxex';
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async getInventory(@Req() req: Request, @Query('appid') appid) {
    const user = req?.user;
    return await this.inventoryService.getInventory(
      user.id,
      appid || ESteamAppId.CSGO,
    );
  }
}

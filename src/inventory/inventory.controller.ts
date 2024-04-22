import { Controller, Get, Post, Query, Req, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Request } from 'express';
import { ESteamAppId } from 'src/constants';
import { ValidateInventoryDTO } from './dto/validate-inventory.dto';
import { Public } from 'src/auth/public.decorator';
import { SteamService } from 'src/steam/steam.service';
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly steamService: SteamService,
  ) {}

  @Get()
  async getInventory(@Req() req: Request, @Query('appid') appid) {
    const user = req?.user;
    return await this.inventoryService.getInventory(
      user.id,
      appid || ESteamAppId.CSGO,
    );
  }

  @Get('trade-offers')
  async getActiveTradeOffers(@Req() req: Request) {
    const steamId = String(req?.user?._json?.steamid);
    return this.inventoryService.allActiveTrades(steamId);
  }

  @Public()
  @Post('validate-inventory')
  async validateInventory(@Body() body: ValidateInventoryDTO) {
    console.log(body);
    return this.steamService.validateItems(body);
  }
}

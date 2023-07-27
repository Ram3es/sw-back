import { Controller, Get, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { ESteamAppId } from 'src/constants';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('/offers')
  async getOffers(@Query() query) {
    const { appid, sortBy, page } = query;
    return await this.marketService.getOffers(
      appid || ESteamAppId.CSGO,
      sortBy,
      page || 1,
    );
  }
}

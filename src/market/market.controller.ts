import {
  Body,
  Controller,
  Get,
  Query,
  Req,
  Post,
  ValidationPipe,
  UsePipes,
  ParseArrayPipe,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { Request } from 'express';
import { BuyItemDTO } from './dto/buy-items.dto';
import { WithdrawDTO } from './dto/withdraw.dto';
import { ESteamAppId } from 'src/constants';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('inventory')
  getOnSiteInventory(@Req() req: Request, @Query('appid') appid) {
    const user = req?.user;
    return this.marketService.getOnSiteInventory(user._json.steamid, appid);
  }

  @Post('buy')
  @UsePipes(new ValidationPipe({ transform: true }))
  buyItems(
    @Req() req: Request,
    @Body(new ParseArrayPipe({ items: BuyItemDTO })) body,
  ) {
    const user = req?.user;
    return this.marketService.addItemsToInventory(user._json.steamid, body);
  }

  @Post('withdraw')
  withdrawItems(@Req() req: Request, @Body() { assetIds }: WithdrawDTO) {
    const user = req?.user;
    return this.marketService.withdrawItems(user._json.steamid, assetIds);
  }

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

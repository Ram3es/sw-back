import {
  Body,
  Controller,
  Get,
  Query,
  Req,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { Request } from 'express';
import { WithdrawDTO } from './dto/withdraw.dto';
import { ESteamAppId } from 'src/constants';
import { Public } from 'src/auth/public.decorator';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('inventory')
  async getOnSiteInventory(@Req() req: Request, @Query() query) {
    const user = req?.user;
    const {
      appid,
      gameId,
      itemName,
      category,
      minPrice,
      maxPrice,
      minWear,
      maxWear,
      otherTags,
    } = query;
    const inventory = await this.marketService.getOnSiteInventory(
      user._json.steamid,
      appid,
    );
    return inventory
      .sort((a, b) => Number(b.tradable) - Number(a.tradable))
      .sort((a, b) => a.withdrawn - b.withdrawn);
  }

  @Post('buy')
  buyItems(@Req() req: Request, @Body() { assetIds }: WithdrawDTO) {
    const user = req?.user;
    if (!assetIds.length) {
      throw new BadRequestException([
        'each value in assetIds must be a string',
      ]);
    }
    return this.marketService.addItemsToInventory(user._json.steamid, assetIds);
  }

  @Post('withdraw')
  withdrawItems(@Req() req: Request, @Body() { assetIds }: WithdrawDTO) {
    const user = req?.user;
    return this.marketService.withdrawItems(user._json.steamid, assetIds);
  }

  @Public()
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

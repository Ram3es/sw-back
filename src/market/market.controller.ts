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
}

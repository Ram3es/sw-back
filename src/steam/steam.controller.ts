import { PaymentsService } from 'src/payments/payments.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Headers,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { SteamService } from './steam.service';
import { Public } from 'src/auth/public.decorator';
import { MakeTradeOfferDTO } from './dto/make-trade.dto';

@Controller('steam')
export class SteamController {
  constructor(
    private readonly steamService: SteamService,
    private readonly paymentService: PaymentsService,
  ) {}

  @Public()
  @Post('trade-webhook')
  async handleTrades(
    @Headers('des-labs-auth') hash: string,
    @Body() body: any,
  ) {
    const istrustworthyWebhook = this.paymentService.checkWebhookHash(hash);
    if (!istrustworthyWebhook) {
      throw new ForbiddenException('access denied');
    }
    return this.steamService.manageTrade(body);
  }

  @Post('make-offer')
  async makeOffer(@Req() req: Request, @Body() body: MakeTradeOfferDTO) {
    const steamId = String(req?.user?._json?.steamid);
    return this.steamService.makeTradeOffer(steamId, body);
  }

  @Get('create-trade/:id')
  async createTrade(@Req() req: Request, @Param('id') tradeId: string) {
    const steamId = String(req?.user?._json?.steamid);
    return this.steamService.createTradeOffer(steamId, tradeId);
  }

  @Get('tradehold')
  async getTradehold(@Req() req: Request) {
    const steamId = String(req?.user?._json?.steamid);
    return this.steamService.getTradeHoldDuration(steamId);
  }
}

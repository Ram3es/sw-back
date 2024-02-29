import { PaymentsService } from 'src/payments/payments.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { SteamService } from './steam.service';
import { Public } from 'src/auth/public.decorator';
import { CreateTradeDto } from './dto/create-trade.dto';

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

  @Post('create-trade')
  async createTrade(@Req() req: Request, @Body() body: CreateTradeDto) {
    const steamId = String(req?.user?._json?.steamid);
    return this.steamService.createTradeOffer(steamId, body);
  }

  @Get('tradehold')
  async getTradehold(@Req() req: Request) {
    const steamId = '76561199474829583' || String(req?.user?._json?.steamid);
    return this.steamService.getTradeHoldDuration(steamId);
  }
}

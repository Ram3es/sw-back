import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { RedeemDTO } from './dto/redeem.dto';
import { WalletService } from './wallet.service';
import { PayinDTO } from './dto/payin.dto';
import { Request } from 'express';
import { PayoutDTO } from './dto/payout.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Post('redeem-giftcard')
  async redeemGiftCard(@Body() body: RedeemDTO, @Req() req: any) {
    const steamId = String(req?.user?._json?.steamid);
    return this.walletService.reedeemCardTransaction(steamId, body);
  }

  @Post('payin')
  async makePayin(@Req() req: Request, @Body() body: PayinDTO) {
    const steamId = String(req?.user?._json?.steamid);
    return this.walletService.makePayIn(steamId, body);
  }

  @Post('payout')
  async makePayout(@Req() req: Request, @Body() body: PayoutDTO) {
    const steamId = String(req?.user?._json?.steamid);
    return this.walletService.makePayOut(steamId, body);
  }

  @Get()
  async getUserWallets(@Req() req: Request) {
    const steamId = String(req?.user?._json?.steamid);
    return this.walletService.getUserWalletsById(steamId);
  }
}

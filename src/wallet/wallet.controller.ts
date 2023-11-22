import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { RedeemDTO } from './dto/redeem.dto';
import { WalletService } from './wallet.service';
import { PayoutDTO } from './dto/payin.dto';
import { Request } from 'express'

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Post('redeem-giftcard')
  async redeemGiftCard(@Body() body: RedeemDTO, @Req() req: any) {
    const steamId = String(req?.user?._json?.steamid);
    return this.walletService.reedeemCardTransaction(steamId, body);
  }

  @Post('payin')
  async makePayin(@Req() req: Request, @Body() body: PayoutDTO) {
    const steamId = String(req?.user?._json?.steamid);
    return this.walletService.makePayIn(steamId, body);
  }
}

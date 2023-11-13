import { Body, Controller, Post, Req } from '@nestjs/common';
import { RedeemDTO } from './dto/redeem.dto';
import { WalletService } from './wallet.service';
import { PayoutDTO } from './dto/payin.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Post('redeem-giftcard')
  async redeemGiftCard(@Body() body: RedeemDTO, @Req() req: any) {
    const steamId = String(req?.user?._json?.steamid);
    return this.walletService.reedeemCardTransaction(steamId, body);
  }

  @Post('payin')
  makePayin(@Req() req: any, @Body() body: PayoutDTO) {
    const steamId = '76561199474829583' || String(req?.user?._json?.steamid);
    return this.walletService.makePayIn(steamId, body);
  }
}

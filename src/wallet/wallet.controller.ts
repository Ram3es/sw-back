import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { RedeemDTO } from './dto/redeem.dto';
import { Public } from 'src/auth/public.decorator';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Public()
  @Post('redeem-giftcard')
  async redeemGiftCard(@Body() body: RedeemDTO, @Req() req: any) {
    const steamId = '76561199474829583' || String(req?.user?._json?.steamid);
    if (!steamId) throw new UnauthorizedException();
    return this.walletService.reedeemCardTransaction(steamId, body);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayoutDTO } from './dto/payments.dto';
import { Request } from 'express';
import coupones from './mocks/coupones.js';
import { Public } from 'src/auth/public.decorator';
import { PayInWebhookDTO } from './dto/payin-webhook.dto';
import { TransactionsService } from 'src/transactions/transactions.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('payment-methods')
  getPaymentMethods() {
    return this.paymentsService.getPaymentMethods();
  }

  @Public()
  @Post('payin-webhook')
  handlePayinTransaction(
    @Headers('des-labs-auth') hash: string,
    @Body() body: PayInWebhookDTO,
  ) {
    const istrustworthyWebhook = this.paymentsService.checkWebhookHash(hash);
    if (!istrustworthyWebhook) {
      throw new ForbiddenException('access denied');
    }
    return this.transactionsService.payInUserTransaction(body);
  }

  @Post('couponValidation')
  validateCoupone(@Req() req: Request, @Body() body) {
    const user = req?.user;
    if (!user) throw new UnauthorizedException();
    const { coupon = null } = body;
    if (!coupon || !coupones.includes(coupon)) {
      throw new BadRequestException({ message: 'Coupon not valid.' });
    }
    return { message: 'Coupone valid' };
  }

  @Post('payout')
  makePayout(@Req() req: Request, @Body() body: PayoutDTO) {
    const user = req?.user;
    const { amount } = body;
    if (!user) throw new UnauthorizedException();
    return this.paymentsService.makePayout({ steamId: user.id, amount });
  }

  @Get('transactions')
  getPaymentsTransactions(@Req() req: Request) {
    const steamId = req?.user?._json?.steamid;
    return this.paymentsService.getTransactions(steamId);
  }

  @Get('limits')
  async getDailyLimits(@Req() req: Request) {
    const user = req?.user;
    const amount = await this.paymentsService.getDailyLimitsByUser(user.id);
    return { amount };
  }
}

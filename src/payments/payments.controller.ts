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
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
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

  @Get('transactions')
  getPaymentsTransactions(@Req() req: Request, @Query() query) {
    const steamId = req?.user?._json?.steamid;
    const { type } = query;
    return this.paymentsService.getTransactions(steamId, type);
  }

  @Get('limits')
  async getDailyLimits(@Req() req: Request) {
    const user = req?.user;
    const amount = await this.paymentsService.getDailyLimitsByUser(user.id);
    return { amount };
  }
}

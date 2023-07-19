import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayoutDTO } from './dto/payments.dto';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payment-methods')
  getPaymentMethods() {
    return {
      paypal: {
        fixedFee: 0.021,
        fee: 25,
        max: 100000,
        min: 100,
        enabled: true,
      },
      venmo: {
        fixedFee: 0.021,
        fee: 25,
        max: 100000,
        min: 100,
        enabled: true,
      },
      crypto: {
        fixedFee: 0.021,
        fee: 25,
        max: 100000,
        min: 100,
        enabled: true,
      },
      webmoney: {
        fixedFee: 0.021,
        fee: 25,
        max: 100000,
        min: 100,
        enabled: true,
      },
    };
    // return this.paymentsService.getPaymentMethods();
  }

  @Post('payout')
  makePayout(@Req() req: Request, @Body() body: PayoutDTO) {
    const user = req?.user;
    const { amount } = body;
    if (!user) throw new UnauthorizedException();
    return this.paymentsService.makePayout({ steamId: user.id, amount });
  }

  @Get('transactions')
  getPaymentsTransactions() {
    return this.paymentsService.getTransactions();
  }

  @Get('limits')
  async getDailyLimits(@Req() req: Request) {
    const user = req?.user;
    const amount = await this.paymentsService.getDailyLimitsByUser(user.id);
    return { amount };
  }
}

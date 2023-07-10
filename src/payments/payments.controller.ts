import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayoutDTO } from './dto/payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('payment-methods')
  getPaymentMethods() {
    return this.paymentsService.getPaymentMethods();
  }

  @Post('payout')
  makePayout(@Body() body: PayoutDTO) {
    return this.paymentsService.makePayout(body);
  }
}

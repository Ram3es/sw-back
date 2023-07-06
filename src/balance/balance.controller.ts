import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}
  @Public()
  @Get('test')
  test() {
    return this.balanceService.test();
  }
}

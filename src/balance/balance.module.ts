import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [],
})
export class BalanceModule {}

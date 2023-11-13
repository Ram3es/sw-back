import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [HttpModule, TransactionsModule, DbModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}

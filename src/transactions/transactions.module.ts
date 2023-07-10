import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [DbModule],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

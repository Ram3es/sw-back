import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [DbModule, TransactionsModule],
  providers: [MarketService],
  controllers: [MarketController],
  exports: [],
})
export class MarketModule {}

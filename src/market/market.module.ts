import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { SteamModule } from 'src/steam/steam.module';

@Module({
  imports: [DbModule, TransactionsModule, SteamModule],
  providers: [MarketService],
  controllers: [MarketController],
  exports: [],
})
export class MarketModule {}

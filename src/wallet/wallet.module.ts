import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { PaymentsModule } from 'src/payments/payments.module';
import { DbModule } from 'src/db/db.module';
import { WalletService } from './wallet.service';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [PaymentsModule, DbModule, TransactionsModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}

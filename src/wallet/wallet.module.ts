import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { PaymentsModule } from 'src/payments/payments.module';
import { DbModule } from 'src/db/db.module';
import { WalletService } from './wallet.service';

@Module({
  imports: [PaymentsModule, DbModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}

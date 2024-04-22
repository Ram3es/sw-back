import { Module, forwardRef } from '@nestjs/common';
import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';
import { HttpModule } from '@nestjs/axios';
import { DbModule } from 'src/db/db.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { InventoryService } from 'src/inventory/inventory.service';

@Module({
  controllers: [SteamController],
  providers: [SteamService],
  imports: [
    HttpModule,
    DbModule,
    PaymentsModule,
    forwardRef(() => InventoryModule),
  ],
  exports: [SteamService],
})
export class SteamModule {}

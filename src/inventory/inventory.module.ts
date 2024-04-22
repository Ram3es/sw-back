import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { DbModule } from 'src/db/db.module';
import { SteamModule } from 'src/steam/steam.module';

@Module({
  imports: [DbModule, SteamModule],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}

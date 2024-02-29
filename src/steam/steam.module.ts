import { Module } from '@nestjs/common';
import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';
import { HttpModule } from '@nestjs/axios';
import { DbModule } from 'src/db/db.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  controllers: [SteamController],
  providers: [SteamService],
  imports: [HttpModule, DbModule, PaymentsModule],
  exports: [SteamService],
})
export class SteamModule {}

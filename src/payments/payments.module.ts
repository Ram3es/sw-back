import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [HttpModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [],
})
export class PaymentsModule {}

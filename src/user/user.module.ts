import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DbModule } from 'src/db/db.module';
import { UserController } from './user.controller';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [DbModule, TransactionsModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

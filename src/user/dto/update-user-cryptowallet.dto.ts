import { PartialType } from '@nestjs/mapped-types';
import { CreateUserCryptoWalletDTO } from './create-user-cryptowallet.dto';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateUserCryptWalletDTO extends PartialType(
  CreateUserCryptoWalletDTO,
) {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id: number;
}

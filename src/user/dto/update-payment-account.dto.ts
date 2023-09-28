import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { CreatePaymentAccountDTO } from './create-payment-account.dto';

export class UpdatePaymentAccountDTO extends PartialType(
  CreatePaymentAccountDTO,
) {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  id?: number;
}
